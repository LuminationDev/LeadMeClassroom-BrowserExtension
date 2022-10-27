import { devConfig, prodConfig } from './_service';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import {browserLocalPersistence, getAuth, setPersistence} from "@firebase/auth";

const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

class Firebase {
    constructor(callback) {
        this.callback = callback;

        try {
            firebase.initializeApp(config);
        } catch (err) {
            if (!/already exists/.test(err.message)) {
                console.error('Firebase initialization error', err.stack);
            }
        }

        //Real-time database reference
        this.db = firebase.database();
    }

    /**
     * Get the display name of the currently active user.
     * @returns {string} A string representing a display name.
     */
    getDisplayName = async () => {
        await setPersistence(getAuth(), browserLocalPersistence);
        return getAuth().currentUser?.displayName;
    }

    /**
     * Update the Real Time Database with the pass object.
     * @param {*} leader An object representing the current leader
     */
    connectAsLeader = (leader) => {
        this.db.ref(`classCode`).update(leader.getClassroomObject());
    }

    /**
     * Add listeners for followers being added and removed to the database
     * @param classCode
     * @param followerResponse
     * @param {*} followerDisconnected
     */
    classRoomListeners = (classCode, followerResponse, followerDisconnected) => {
        //Listen for any followers being added
        this.db.ref(`/classCode/${classCode}/followers`).on('child_added', snapshot => {
            this.followerListener(classCode, followerResponse, snapshot.val().name, snapshot.key);
        });

        this.db.ref(`/classCode/${classCode}/followers`).on('child_removed', snapshot => {
            followerDisconnected(snapshot.key);
        });
    }

    /**
     * Add a listener to an individual follower entry
     */
    followerListener = (classCode, followerResponse, name, id) => {
        this.db.ref(`/classCode/${classCode}/followers/${id}`).on('child_changed', snapshot => {
            if (snapshot.val().type == null) {
                return;
            }

            console.log("Follower response");
            followerResponse(snapshot.val(), name, id);
        });
    }

    /**
     * Run through all the student entries within the existing class entry and reattach the listeners that may have
     * been severed when a page reload occurred, loading the students again to the dashboard as well.
     * @param classCode
     * @param followerResponse
     */
    reloadFollowers = (classCode, followerResponse) => {
        this.db.ref(`/classCode/${classCode}/followers/`).get().then(snapshot => {
            snapshot.forEach(entry => {
                followerResponse(entry.val().screenshot, entry.val().name, entry.key);
            });
        });
    }

    /**
     * Attempt to find a class code matching the input, return whether the attempt was successful or not
     */
    async checkForClassroom(inputCode) {
        return await this.db.ref("/classCode").child(inputCode).get().then((snapshot) => {
            return snapshot.exists();
        }).catch((error) => {
            console.log(error);
            return false;
        });
    }

    /**
     * Attempt to find a follower uuid matching the input, return whether the attempt was successful or not
     */
    async checkForFollower(inputCode, inputUUID) {
        return await this.db.ref("/classCode").child(inputCode).child("followers").child(inputUUID).get().then((snapshot) => {
            return snapshot.exists();
        }).catch((error) => {
            console.log(error);
            return false;
        });
    }

    /**
     * Add a follower object to the classrooms followers array.
     * @param {*} data A Follower object.
     */
    addFollower = (data) => {
        this.db.ref(`/classCode/${data.getClassCode()}/followers`).update(data.getFollowerObject())
            .then(result => console.log(result));
    }

    /**
     * Remove an entry from firebase at the specified location.
     * @param {*} classCode 
     * @param {*} uuid 
     */
    async removeFollower(classCode, uuid) {
        return await this.db.ref(`/classCode/${classCode}/followers/${uuid}`).remove().then(() => {
            return true;
        }).catch((error) => {
            console.log(error);
            return false;
        });
    }

    /**
     * Sent from a leader, push an action request to all followers. This could be a video_permission, muteTab etc..
     * @param classCode
     * @param {*} type
     */
    requestAction = async (classCode, type) => {
        const msg = this.db.ref("classCode").child(classCode).child("/request").push(type);
        await msg.remove();
    }

    /**
     * Sent from a leader, push an action request to a particular follower. This could be a video_permission, muteTab etc..
     * @param classCode
     * @param uuid
     * @param {*} type
     */
    requestIndividualAction = async (classCode, uuid, type) => {
        const msg = this.db.ref("classCode").child(classCode).child("followers").child(uuid).child("/request").push(type);
        await msg.remove();
    }

    /**
     * Sent from a follower, push an action response to the leader. This could be a video_permission, off task notification etc..
     * @param classCode
     * @param uuid
     * @param action
     */
    sendResponse = (classCode, uuid, action) => {
        this.db.ref("classCode").child(classCode).child("followers").child(uuid).child("/response").set(action)
            .then(result => console.log(result));
    }

    /**
     * Register listeners on the firebase, applying different listeners depending on what type of users
     * has just connected.
     * @param {*} classCode A string representing the class a user is registered to.
     * @param uuid
     */
    registerListeners = (classCode, uuid) => {
        //Listen for group actions
        this.db.ref("classCode").child(classCode).child("request").on('child_added', (snapshot) => this.callback(snapshot.val()));

        //Listen for individual actions
        this.db.ref("classCode").child(classCode).child("followers").child(uuid).child("request").on('child_added', (snapshot) => this.callback(snapshot.val()));
    }

    /**
     * Unregister any listeners that may be active.
     * @param {*} inputCode A string representing the class a user is registered to.
     * @param uuid
     */
    unregisterListeners = (inputCode, uuid) => {
        this.db.ref("classCode").child(inputCode).child("request").off("child_changed");
        this.db.ref("classCode").child(inputCode).child("followers").child(uuid).child("request").off("child_changed");
    }

    /**
     * Upload a screenshot of the followers computer to firebase as a base 64 message under that direct follower's
     * entry.
     * @param {*} inputCode A string representing the class a user is registered to.
     * @param {*} inputUUID A string representing the unique ID of a follower.
     * @param base64
     */
    sendScreenShot = (inputCode, inputUUID, base64) => {
        this.db.ref("classCode").child(inputCode).child("followers").child(inputUUID).child("screenshot").set(base64)
            .then(result => console.log(result));
    }

    /**
     * Remove the entity of a class entry, at the end of a session the details of the connects will be erased.
     * @param {*} classCode 
     */
    removeClass = (classCode) => {
        const classRef = this.db.ref("classCode").child(classCode);
        this.db.ref("classCode").child(classCode).off();

        classRef.remove()
            .then(function () { console.log("Remove succeeded.") })
            .catch(function (error) { console.log("Remove failed: " + error.message) });
    }
}

export default Firebase;
