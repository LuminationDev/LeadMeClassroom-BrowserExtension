import { devConfig, prodConfig } from './_service';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import {browserLocalPersistence, getAuth, setPersistence} from "@firebase/auth";

const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

class Firebase {
    constructor() {
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
     * Create a new room on the real time database
     */
    connectAsLeader = (leader) => {
        this.generateRoom(leader);
    }

    /**
     * Add listeners for followers being added and removed to the database
     * @param classCode
     * @param followerResponse
     * @param {*} followerDisconnected
     */
    followerListeners = (classCode, followerResponse, followerDisconnected, followerAdded) => {
        this.db.ref(`/followers/${classCode}`).on('child_added', async snapshot => {
            followerAdded(snapshot.val(), snapshot.key)
            let name = snapshot.val().name
            let id = snapshot.key
            this.db.ref(`/followers/${classCode}/${id}`).on('child_changed', snapshot => {
                followerResponse(snapshot.val(), name, id, snapshot.key);
            });
        });

        this.db.ref(`/followers/${classCode}`).on('child_removed', snapshot => {
            followerDisconnected(snapshot.key);
        });
    }

    /**
     * Add listeners for followers being added and removed to the database
     * @param classCode
     * @param followerResponse
     * @param {*} followerDisconnected
     */
    tabListeners = (classCode, followerTabChanged, followerTabRemoved, followerTabsAdded) => {
        this.db.ref(`/tabs/${classCode}`).on('child_added', async snapshot => {
            followerTabsAdded(snapshot.val(), snapshot.key)
            let followerId = snapshot.key
            this.db.ref(`/tabs/${classCode}/${followerId}`).on('child_changed', snapshot => {
                followerTabChanged(snapshot.val(), followerId, snapshot.key);
            });

            this.db.ref(`/tabs/${classCode}/${followerId}`).on('child_removed', snapshot => {
                followerTabRemoved(followerId, snapshot.key)
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
        return await this.db.ref("/followers").child(inputCode).child(inputUUID).get().then((snapshot) => {
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
        this.db.ref(`/followers/${data.getClassCode()}`).update(data.getFollowerObject())
            .then(result => console.log(result));
        this.db.ref(`/tabs/${data.getClassCode()}`).update(data.getTabsObject())
            .then(result => console.log(result));
    }

    /**
     * Remove an entry from firebase at the specified location.
     * @param {*} classCode 
     * @param {*} uuid 
     */
    async removeFollower(classCode, uuid) {
        return await this.db.ref(`/followers/${classCode}/${uuid}`).remove().then(() => {
            return true;
        }).catch((error) => {
            console.log(error);
            return false;
        });
    }

    /**
     * Update the Real Time Database with the pass object.
     * @param {*} object A JSON structured object to be uploaded into the database.
     */
    generateRoom = (leader) => {
        this.db.ref(`classCode`).update(leader.getClassroomObject()).then(result => console.log(result));
        this.db.ref(`followers`).update(leader.getDefaultFollowersObject()).then(result => console.log(result));
        this.db.ref(`tabs`).update(leader.getDefaultTabsObject()).then(result => console.log(result));
    }

    /**
     * Sent from a leader, push an action request to all followers. This could be a video_permission, muteTab etc..
     * @param classCode
     * @param {*} type
     */
    requestAction = (classCode, type) => {
        const msg = this.db.ref("classCode").child(classCode).child("/request").push(type);
        msg.remove().then(result => console.log(result));
    }

    /**
     * Sent from a leader, push an action request to a particular follower. This could be a video_permission, muteTab etc..
     * @param classCode
     * @param uuid
     * @param {*} type
     */
    requestIndividualAction = (classCode, uuid, type) => {
        const msg = this.db.ref("followers").child(classCode).child(uuid).child("/request").push(type);
        msg.remove().then(result => console.log(result));
    }

    /**
     * Sent from a follower, push an action response to the leader. This could be a video_permission, off task notification etc..
     * @param classCode
     * @param uuid
     * @param action
     */
    sendResponse = (classCode, uuid, action) => {
        this.db.ref("followers").child(classCode).child(uuid).child("/response").set(action)
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
        this.db.ref("followers").child(classCode).child(uuid).child("request").on('child_added', (snapshot) => this.callback(snapshot.val()));
    }

    /**
     * Unregister any listners that may be active.
     * @param {*} inputCode A string representing the class a user is registered to.
     * @param uuid
     */
    unregisterListeners = (inputCode, uuid) => {
        this.db.ref("classCode").child(inputCode).child("request").off("child_changed");
        this.db.ref("followers").child(inputCode).child(uuid).child("request").off("child_changed");
    }

    /**
     * Upload a screenshot of the followers computer to firebase as a base 64 message under that direct follower's
     * entry.
     * @param {*} inputCode A string representing the class a user is registered to.
     * @param {*} inputUUID A string representing the unique ID of a follower.
     * @param base64
     */
    sendScreenShot = (inputCode, inputUUID, base64) => {
        this.db.ref("followers").child(inputCode).child(inputUUID).child("screenshot").set(base64)
            .then(result => console.log(result));
    }

    /**
     * Upload a screenshot of the followers computer to firebase as a base 64 message under that direct follower's
     * entry.
     * @param {*} inputCode A string representing the class a user is registered to.
     * @param {*} inputUUID A string representing the unique ID of a follower.
     * @param base64
     */
    updateTab = (inputCode, inputUUID, tab) => {
        this.db.ref("tabs").child(inputCode).child(inputUUID).child(tab.id).set(tab)
            .then(result => console.log(result));
    }

    updateActiveTab = (inputCode, inputUUID, tabId) => {
        this.db.ref("tabs").child(inputCode).child(inputUUID).child(tabId).child("lastActivated").set(Date.now())
            .then(result => console.log(result));
    }

    removeTab = (inputCode, inputUUID, tabId) => {
        this.db.ref("tabs").child(inputCode).child(inputUUID).child(tabId).remove()
            .then(result => console.log(result));
    }

    /**
     * Remove the entity of a class entry, at the end of a session the details of the connects will be erased.
     * @param {*} classCode 
     */
    removeClass = (classCode) => {
        const classRef = this.db.ref("classCode").child(classCode);
        const followersRef = this.db.ref("followers").child(classCode);
        const tabsRef = this.db.ref("tabs").child(classCode);

        classRef.remove()
            .then(function () {
                console.log("Remove succeeded.")
            })
            .catch(function (error) {
                console.log("Remove failed: " + error.message)
            });

        followersRef.remove()
            .then(function () {
                console.log("Remove succeeded.")
            })
            .catch(function (error) {
                console.log("Remove failed: " + error.message)
            });

        tabsRef.remove()
            .then(function () {
                console.log("Remove succeeded.")
            })
            .catch(function (error) {
                console.log("Remove failed: " + error.message)
            });
    }
}

export default Firebase;
