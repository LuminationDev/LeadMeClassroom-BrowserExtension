import { devConfig, prodConfig } from './_service';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

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
     * Create a new room on the real time database
     */
    connectAsLeader = (leader) => {
        let classroom = leader.getClassroomObject();
        this.generateRoom(classroom);
    }

    /**
     * Add listeners for followers being added and removed to the database
     * @param {*} newFollowerListener 
     * @param {*} followerDisconnected 
     */
    classRoomListeners = (classCode, newFollower, followerDisconnected) => {
        //Listen for any followers being added
        this.db.ref(`/classCode/${classCode}/followers`).on('child_added', snapshot => { 
            this.followerListener(classCode, newFollower, snapshot.key);
        });
        
        this.db.ref(`/classCode/${classCode}/followers`).on('child_removed', snapshot => {
            console.log("Follower removed");
            console.log(snapshot.val());
            followerDisconnected(snapshot.key);
        });
    }

    /**
     * Add a listener to an individual follower entry
     */
    followerListener = (classCode, newFollower, id) => {
        this.db.ref(`/classCode/${classCode}/followers/${id}`).on('child_changed', snapshot => {
            console.log(snapshot.val());
    
            if(snapshot.val().message != null) {
                return;
            }

            //Create a new follower box each time a follower connects
            console.log("Follower added");
            newFollower(snapshot.val(), id);
        });
    }

    /**
     * Attempt to find a class code matching the input, return whether the attempt was succesful or not
     */
    async checkForClassroom (inputCode) {
        return await this.db.ref("/classCode").child(inputCode).get().then((snapshot) => {
            return snapshot.exists();
        }).catch((error) => {
            console.log(error);
            return false;
        });
    }

    /**
     * Attempt to find a follower uuid matching the input, return whether the attempt was succesful or not
     */
    async checkForFollower (inputCode, inputUUID) {
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
        this.db.ref(`/classCode/${data.getClassCode()}/followers`).update(data.getFollowerObject());
    }

    /**
     * Remove an entry from firebase at the specified location.
     * @param {*} classCode 
     * @param {*} uuid 
     */
    async removeFollower (classCode, uuid) {
        return await this.db.ref(`/classCode/${classCode}/followers/${uuid}`).remove().then(() => {
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
    generateRoom = (object) => {
        this.db.ref(`classCode`).update(object);
    }

    /**
     * Sent from a leader, push an action request to all followers. This could be a video_permission, muteTab etc..
     * @param {*} type 
     */
     requestAction = (classCode, type) => {
        var msg = this.db.ref("classCode").child(classCode).child("/request").push(type);
        msg.remove();
    }

    /**
     * Sent from a leader, push an action request to a particular follower. This could be a video_permission, muteTab etc..
     * @param {*} type 
     */
    requestIndividualAction = (classCode, uuid, type) => {
        var msg = this.db.ref("classCode").child(classCode).child("followers").child(uuid).child("/request").push(type);
        msg.remove();
    }

    /**
     * Register listeners on the firebase, applying different listeners depending on what type of users
     * has just connected.
     * @param {*} classCode A string representing the class a user is registered to. 
     */
    registerListeners = (classCode, uuid) => {
        //Listen for group actions
        this.db.ref("classCode").child(classCode).child("request").on('child_added', (snapshot) => this.callback(snapshot.val()));

        //Listen for individual actions
        this.db.ref("classCode").child(classCode).child("followers").child(uuid).child("request").on('child_added', (snapshot) => this.callback(snapshot.val()));
    }

    /**
     * Unregister any listners that may be active.
     * @param {*} inputCode A string representing the class a user is registered to.  
     */
    unregisterListeners = (inputCode) => {
        this.db.ref("classCode").child(inputCode).child("request").off("child_changed");
        this.db.ref("classCode").child(inputCode).child("followers").child(uuid).child("request").off("child_changed");
    }

    /**
     * Upload a screen shot of the followers computer to firebase as a base 64 message under that direct follower's
     * entry.
     * @param {*} inputCode A string representing the class a user is registered to. 
     * @param {*} inputUUID A string representing the unique ID of a follower.
     */
    sendScreenShot = (inputCode, inputUUID, base64) => {
        this.db.ref("classCode").child(inputCode).child("followers").child(inputUUID).child("screenshot").set(base64);
    }
}

export default Firebase;
