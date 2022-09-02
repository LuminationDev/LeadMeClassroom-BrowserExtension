import { Firebase, WebRTC } from '../../controller';
import { Follower } from '../../models';

export class ConnectionManager {
    constructor() {
        this.firebase = new Firebase();
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
        
        let data = {
            "type": "storage",
            "code": userCode,
            "uuid": follower.getUniqueId()
        }
        chrome.runtime.sendMessage(data, null);

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
     * Contact firebase and check if a follower's UUID already exists on the system.
     */
    checkForExistingConnection = () => {
        chrome.storage.sync.get("follower", async (data) => {
            if(data == null) {
                console.log("Nothing Saved");
                return;
            }
    
            if(data.follower == null) {
                console.log("No Follower details found");
                return;
            }
    
            if(data.follower.code != null) {
                //Check for the classroom
                let success = await this.checkForClassroom(data.follower.code);
    
                if(!success) { 
                    return;
                }
    
                //Check for the UUID
                success = await this.firebase.checkForFollower(data.follower.code, data.follower.uuid);
    
                if(!success) { 
                    return;
                }

                this.connectionMethods(data.follower.code, data.follower.uuid);
            }
        });
    }

    /**
     * Register the appropriate firebase listeners for a follower, capture the current screen and setup
     * a new WebRTC peer connection.
     * @param {*} classCode 
     * @param {*} uuid 
     */
    connectionMethods = (classCode, uuid) => {
        this.firebase.registerListeners(classCode);
        this.captureScreen(classCode, uuid);
        this.webRTC = new WebRTC(this.firebase.db, classCode, uuid);
    }

    /**
     * Send a message to the background script to capture the current visible tab. The response is a base64
     * message that can be sent to firebase.
     */
    captureScreen = (code, uuid) => {
        chrome.runtime.sendMessage({"type": "capture"}, async (response) => {
            console.log(response);
            this.firebase.sendScreenShot(code, uuid, response);
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
