import { Firebase, WebRTC } from './index';
import { Follower } from '../models';

export class ConnectionManager {
    constructor(callback) {
        this.classCode;
        this.uuid;

        this.firebase = new Firebase(callback);
        this.webRTC;
    }

    /**
     * Create an initial connection with the firebase.
     * @param {*} userCode 
     */
    connect = async (userCode) => {
        let success = await this.checkForClassroom(userCode);

        if(!success) {
            console.log("Class not found");
        }
    
        let follower = new Follower(userCode, "Placeholder");
        
        chrome.storage.sync.set({ 
            "follower": 
            {
                "code": userCode,
                "uuid": follower.getUniqueId()
            } 
        });

        this.firebase.addFollower(follower);

        this.connectionMethods(follower.code, follower.uniqueId);
    } 

    /**
     * Remove the connection to firebase. Used when signing out or tab becomes inactive.
     */
    disconnect = () => {
        if(this.webRTC != null) {
            this.firebase.disconnectFirebase(this.webRTC.classCode);
        }
    }

    /**
     * Register the appropriate firebase listeners for a follower, capture the current screen and setup
     * a new WebRTC peer connection.
     * @param {*} classCode 
     * @param {*} uuid 
     */
    connectionMethods = (classCode, uuid) => {
        this.classCode = classCode;
        this.uuid = uuid;
        this.firebase.registerListeners(classCode);
        this.captureScreen(classCode, uuid);
        this.webRTC = new WebRTC(this.firebase.db, classCode, uuid);
    }

    /**
     * Send a message to the background script to capture the current visible tab. The response is a base64
     * message that can be sent to firebase.
     */
    captureScreen = () => {
        chrome.runtime.sendMessage({"type": "capture"}, async (response) => {
            console.log(response);
            this.firebase.sendScreenShot(this.classCode, this.uuid, response);
        });
    }

    /**
     * Check if a class room code exists on the firebase.
     * @param {*} code 
     * @returns 
     */
    checkForClassroom = async (code) => {
        return await this.firebase.checkForClassroom(code);
    }

    /**
     * Prepare the stream for a webRTC connection.
     */
    setupNewWebRTCConnection = () => {
        this.webRTC = new WebRTC(this.firebase.db, userCode, follower.uniqueId);
        this.webRTC.prepareScreen();
    }
}
