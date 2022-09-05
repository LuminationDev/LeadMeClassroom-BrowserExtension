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
     * Update the Real Time Database with the pass object.
     * @param {*} object A JSON structured object to be uploaded into the database.
     */
    generateRoom = (object) => {
        this.db.ref(`/classCode`).update(object);
    }

    /**
     * Update the Real Time Database with the pass object.
     * @param {*} object A JSON structured object to be uploaded into the database.
     */
    doUpdate = (code, object) => {
        this.db.ref(`/classCode/${code}`).update(object);
    }

    /**
     * Register listeners on the firebase, applying different listeners depending on what type of users
     * has just connected.
     * @param {*} inputCode A string representing the class a user is registered to. 
     */
    registerListeners = (inputCode) => {
        let launch = this.db.ref("/classCode").child(inputCode).child("launchURL");
        launch.on('child_changed', (snapshot) => {
            this.callback({
                "type" : "website", 
                "value" : snapshot.val()
            });

            //TODO Use send message for active tab?
            // if(window.location.href != `https://${snapshot.val()}`) {
            //     window.location = `https://${snapshot.val()}`;
            // }
        })
    }

    /**
     * Unregister any listners that may be active.
     * @param {*} inputCode A string representing the class a user is registered to.  
     */
    unregisterListeners = (inputCode) => {
        let launch = this.db.ref("/classCode").child(inputCode).child("launchURL");
        launch.off('child_changed');
    }

    /**
     * Disconnect from firebase
     * @param {*} classCode A string representing the class a user is registered to. 
     */
    disconnectFirebase = (classCode) => {
        console.log("Disconnecting firebase....");
        let launch = this.db.ref("/classCode").child(classCode).child("launchURL");
        launch.off('child_changed');
    }

    /**
     * Upload a screen shot of the followers computer to firebase as a base 64 message under that direct follower's
     * entry.
     * @param {*} inputCode A string representing the class a user is registered to. 
     * @param {*} inputUUID A string representing the unique ID of a follower.
     */
    sendScreenShot = (inputCode, inputUUID, base64) => {
        this.db.ref("/classCode").child(inputCode).child("followers").child(inputUUID).child("screenshot").set(base64);
    }
}

export default Firebase;
