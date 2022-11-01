import Firebase from './_firebase';
import WebRTC from './_webRTC';
import Follower from '/src/models/_follower'
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
     * @param name
     */
    connect = async (follower) => {
        this.follower = follower;
        let success = await this.checkForClassroom(follower.classCode);

        if (!success) {
            console.log("Class not found");
        }

        let uuid = this.follower.getUniqueId();

        await chrome.storage.sync.set({
            "follower":
                {
                    "code": follower.classCode,
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
        if (this.webRTC != null) {
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
        chrome.runtime.sendMessage({ "type": REQUESTS.CAPTURE }, async (response) => {
            this.firebase.uploadScreenshot(response, this.follower.classCode, this.follower.uniqueId);
        });
    }

    updateTab = (tab) => {
        this.firebase.updateTab(this.follower.classCode, this.follower.uniqueId, tab);
    }

    updateActiveTab = (tabId) => {
        this.firebase.updateActiveTab(this.follower.classCode, this.follower.uniqueId, tabId);
    }

    removeTab = (tabId) => {
        this.firebase.removeTab(this.follower.classCode, this.follower.uniqueId, tabId);
    }

    /**
     * Send a response back to a leader when a particular event occurs, i.e accepted/denied monitoring.
     * @param {*} action 
     */
    sendResponse = (action) => {
        action.timeStamp = Date.now(); //Add a time stamp so that the response is always 'different' and the leader picks up it is a different message.
        this.firebase.sendResponse(this.follower.classCode, this.follower.uniqueId, action);
    }

    /**
     * Check if a classroom code exists on the firebase.
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
