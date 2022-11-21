import { Firebase } from './';
import * as REQUESTS from "../constants/_requests";
import {Follower, Tab} from "../models";
import { useStorage } from "../hooks/useStorage";
const { setSyncStorage } = useStorage();

class ConnectionManager {
    public firebase: Firebase;
    private follower!: Follower;
    private intervalID: NodeJS.Timer|undefined;
    private refreshTime: number; //seconds between capture timing

    constructor(callback: Function) {
        this.firebase = new Firebase(callback);
        this.refreshTime = 15;
    }

    /**
     * Create an initial connection with the firebase.
     * @param follower
     */
    connect = async (follower: Follower) => {
        this.follower = follower;
        let success = await this.checkForClassroom(follower.classCode);

        if (!success) { console.log("Class not found"); }

        await setSyncStorage({
            "follower": {
                "code": this.follower.classCode,
                "uuid": this.follower.getUniqueId(),
                "monitoring": false
            }
        });

        this.firebase.addFollower(this.follower);
        this.connectionMethods();
    }

    /**
     * Remove the connection to firebase. Used when signing out or tab becomes inactive.
     */
    disconnect = () => {
        this.firebase.unregisterListeners(this.follower.classCode, this.follower.uniqueId);
    }

    /**
     * Send a message to firebase that a follower has disconnected.
     */
    disconnectFollower = () => {
        void this.firebase.removeFollower(this.follower.classCode, this.follower.uniqueId);
    }

    /**
     * Register the appropriate firebase listeners for a follower, capture the current screen and set up
     * a new WebRTC peer connection.
     */
    connectionMethods = () => {
        this.firebase.registerListeners(this.follower.classCode, this.follower.uniqueId);
        //this.captureScreen();
    }

    /**
     * Enable or disabled the monitoring field within sync storage, starting or stopping the screen capture methods
     * for a follower.
     */
    enableMonitoring = (enable: boolean) => {
        void setSyncStorage({
            "follower": {
                "code": this.follower.classCode,
                "uuid": this.follower.getUniqueId(),
                "monitoring": enable
            }
        });

        if(enable) {
            this.captureScreen();

            //Call the capture screen method every 15 seconds
            this.intervalID = setInterval(() => {
                this.captureScreen();
            }, this.refreshTime * 1000);
        } else {
            clearInterval(this.intervalID);
        }
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

    /**
     * Force the supplied tab into the active tab view.
     * @param tab A Chrome tab object
     */
    forceActiveTab = (tab: Tab) => {
        if (tab.id != null && tab.url != null) {
            chrome.tabs.highlight({tabs: tab.index, windowId: tab.windowId},
                () => chrome.windows.update(tab.windowId, { focused: true, state: 'maximized' }));
        }
    }

    updateTab = (tab: Tab) => {
        this.firebase.updateTab(this.follower.classCode, this.follower.uniqueId, tab);
    }

    updateActiveTab = (tab: Tab) => {
        this.firebase.updateActiveTab(this.follower.classCode, this.follower.uniqueId, tab);
    }

    removeTab = (tabId: string) => {
        this.firebase.removeTab(this.follower.classCode, this.follower.uniqueId, tabId);
    }

    deleteTab = (tabId: string) => {
        void chrome.tabs.remove(parseInt(tabId))
        this.firebase.removeTab(this.follower.classCode, this.follower.uniqueId, tabId);
    }

    /**
     * Send a response back to a leader when a particular event occurs, i.e. accepted/denied monitoring.
     * @param {*} action 
     */
    sendResponse = (action: object) => {
        // @ts-ignore
        action.timeStamp = Date.now(); //Add a time stamp so that the response is always 'different' and the leader picks up it is a different message.
        this.firebase.sendResponse(this.follower.classCode, this.follower.uniqueId, action);
    }

    /**
     * Check if a classroom code exists on the firebase.
     * @param {*} code 
     * @returns 
     */
    checkForClassroom = async (code: string) => {
        return await this.firebase.checkForClassroom(code);
    }
}

export default ConnectionManager;
