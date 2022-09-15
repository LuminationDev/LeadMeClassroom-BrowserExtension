import { Firebase, WebRTC } from './index';
import { Follower } from '../models';
import * as REQUESTS from "../constants/_requests";

class ConnectionManager {
    constructor(callback) {
        this.firebase = new Firebase(callback);
        this.webRTC;
        this.follower;
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
    
        this.follower = new Follower(userCode, "Placeholder");
        let uuid = this.follower.getUniqueId();
        
        chrome.storage.sync.set({ 
            "follower": 
            {
                "code": userCode,
                "uuid": uuid
            } 
        });

        this.firebase.addFollower(this.follower);

        this.connectionMethods(this.follower.classCode, this.follower.uniqueId);
    } 

    /**
     * Remove the connection to firebase. Used when signing out or tab becomes inactive.
     */
    disconnect = () => {
        if(this.webRTC != null) {
            this.firebase.unregisterListeners(this.follower.classCode, this.follower.uniqueId);
        }
    }

    /**
     * Send a message to firebase that a follower has disconnected.
     */
    disconnectFollower = () => {
        this.firebase.removeFollower(this.follower.classCode, this.follower.uniqueId);
    }

    /**
     * Register the appropriate firebase listeners for a follower, capture the current screen and setup
     * a new WebRTC peer connection.
     */
    connectionMethods = () => {
        this.firebase.registerListeners(this.follower.classCode, this.follower.uniqueId);
        this.captureScreen(this.follower.classCode, this.follower.uniqueId);
        this.webRTC = new WebRTC(this.firebase.db, this.follower.classCode, this.follower.uniqueId);
    }

    /**
     * Send a message to the background script to capture the current visible tab. The response is a base64
     * message that can be sent to firebase.
     */
    captureScreen = () => {
        chrome.runtime.sendMessage({"type": REQUESTS.CAPTURE}, async (response) => {
            this.firebase.sendScreenShot(this.follower.classCode, this.follower.uniqueId, response);
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

export default ConnectionManager;
