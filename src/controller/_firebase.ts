import { devConfig, prodConfig } from './_service';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { FirebaseStorage, getStorage, ref as storageRef, uploadString } from 'firebase/storage'
import {
    Database,
    getDatabase,
    ref,
    onChildAdded,
    onChildRemoved,
    onChildChanged,
    get,
    set,
    update,
    push,
    onDisconnect,
    remove,
    off
} from 'firebase/database';
import * as REQUESTS from '../constants/_requests';
import { Follower, Tab } from "../models";
import {
    assistantCallbackFunction,
} from "../constants/_functionTypes";

const config = process.env.NODE_ENV === 'production' ? prodConfig : prodConfig;

class Firebase {
    private readonly callback: assistantCallbackFunction|null;
    private readonly firebase: FirebaseApp|undefined;
    private readonly db: Database;
    private readonly storage: FirebaseStorage;

    private readonly webMessageRef = "webMessages";
    private readonly webFollowerRef = "webFollowers";

    constructor(callback: any = null) {
        this.callback = callback;

        try {
            this.firebase = initializeApp(config);
        } catch (err: any) {
            if (!/already exists/.test(err.message)) {
                console.error('Firebase initialization error', err.stack);
            }
        }

        //Real-time database reference
        this.db = getDatabase(this.firebase);
        this.storage = getStorage(this.firebase);
    }

    /**
     * Attempt to collect the data associated with a teacher's class.
     * @param inputCode
     */
    async collectClassDetails(inputCode: string) {
        const classRef = ref(this.db, `/classCode/${inputCode}/name`);
        return await get(classRef).then((snapshot) => {
            return snapshot.val();
        }).catch((error) => {
            console.log(error);
            return null;
        });
    }

    /**
     * Attempt to find a class code matching the input, return whether the attempt was successful or not
     */
    async checkForClassroom(inputCode: string) {
        const classRef = ref(this.db, `/classCode/${inputCode}/classCode`);
        return await get(classRef).then((snapshot) => {
            return snapshot.val() === inputCode;
        }).catch((error) => {
            console.log(error);
            return false;
        });
    }

    /**
     * Attempt to find the UUID of a follower, checking if they are still a part of the class.
     * @param classCode A string representing the class a user is registered to.
     * @param uuid A string representing the unique ID of a follower.
     */
    async checkForWebFollower(classCode: string, uuid: string) {
        const classRef = ref(this.db, `/webFollowers/${classCode}/${uuid}`);
        return await get(classRef).then((snapshot) => {
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
    addFollower = (data: Follower) => {
        const followerRef = ref(this.db, `/${this.webFollowerRef}/${data.getClassCode()}`);
        update(followerRef, data.getFollowerObject()).then(() => console.log("Follower object added"));

        const followerIdRef = ref(this.db, `/${this.webFollowerRef}/${data.getClassCode()}/${data.getUniqueId()}`);
        onDisconnect(followerIdRef).remove().then(() => console.log("Follower object removed"));

        const tabRef = ref(this.db, `/tabs/${data.getClassCode()}`);
        update(tabRef, data.getTabsObject()).then(() => console.log("Tab object added"));

        const tabIdRef = ref(this.db, `/tabs/${data.getClassCode()}/${data.getUniqueId()}`);
        onDisconnect(tabIdRef).remove().then(() => console.log("Tab object removed"));
    }

    /**
     * Sent from a follower, push an action response to the leader. This could be a video_permission, off task notification etc.
     * @param classCode A string representing the class a user is registered to.
     * @param uuid A string representing the unique ID of a follower.
     * @param action
     */
    sendResponse = (classCode: string, uuid: string, action: object) => {
        set(ref(this.db, `${this.webFollowerRef}/${classCode}/${uuid}/response`), action)
            .then(result => console.log(result));
    }

    /**
     * Register listeners on firebase for a student that has just connected
     * @param {*} classCode A string representing the class a user is registered to.
     * @param uuid A string representing the unique ID of a follower.
     */
    registerListeners = (classCode: string, uuid: string) => {
        //Listen for group actions
        const groupRef = ref(this.db, `classCode/${classCode}/request/${this.webMessageRef}`);
        onChildAdded(groupRef, (snapshot) => this.callback?.(snapshot.val()));

        //Listen for individual action requests
        const individualRef = ref(this.db, `${this.webFollowerRef}/${classCode}/${uuid}/request`);
        onChildAdded(individualRef, (snapshot) => this.callback?.(snapshot.val()));

        //Listen for changes on the follower object
        const taskRef = ref(this.db, `${this.webFollowerRef}/${classCode}/${uuid}`);
        onChildAdded(taskRef, (snapshot) => {
            switch(snapshot.key) {
                case "tasks":
                    const message = {type: "tasks", action: 'added', tasks: snapshot.val()}
                    this.callback?.(message);
                    break;
                default:
                    console.log("Unknown action requested");
            }
        });

        //TODO currently there is no way to remove a single task - EXPAND THIS IN THE FUTURE
        onChildChanged(taskRef, (snapshot) => {
            switch(snapshot.key) {
                case "tasks":
                    const message = {type: "tasks", action: 'added', tasks: snapshot.val()}
                    this.callback?.(message);
                    break;
                default:
                    console.log("Unknown action requested");
            }
        });
        onChildRemoved(taskRef, (snapshot) => {
            switch(snapshot.key) {
                case "tasks":
                    const message = {type: "tasks", action: 'removed', tasks: snapshot.val()}
                    this.callback?.(message);
                    break;
                default:
                    console.log("Unknown action requested");
            }
        });

        //Listen for ice candidates
        const iceRef = ref(this.db, `ice/${classCode}/${uuid}`);
        onChildAdded(iceRef, (snapshot) => {
            // @ts-ignore
            snapshot.type = REQUESTS.MONITORDATA;
            this.callback?.(snapshot);
        });
    }

    /**
     * Unregister any listeners that may be active.
     * @param {*} inputCode A string representing the class a user is registered to.
     * @param UUID A string representing the unique ID of a follower.
     */
    unregisterListeners = (inputCode: string, UUID: string) => {
        off(ref(this.db, `classCode/${inputCode}/request/${this.webMessageRef}`));
        off(ref(this.db, `${this.webFollowerRef}/${inputCode}/${UUID}/request`))
        off(ref(this.db, `${this.webFollowerRef}/${inputCode}/${UUID}/tasks`))
        off(ref(this.db, `ice/${inputCode}/${UUID}`));
    }

    /**
     * Update the users name
     * @param {*} classCode A string representing the class a user is registered to.
     * @param UUID A string representing the unique ID of a follower.
     * @param name A
     */
    updateName = async (classCode: string, UUID: string, name: string) => {
        await update(ref(this.db, `webFollowers/${classCode}/${UUID}`), {name});
    }

    /**
     * Update the database entry of a follower, adding/updating the latest tab that have been opened or an action has been
     * performed on.
     * @param {*} classCode A string representing the class a user is registered to.
     * @param {*} UUID A string representing the unique ID of a follower.
     * @param tab A tab object containing the details of a new tab.
     */
    updateTab = (classCode: string, UUID: string, tab: Tab) => {
        update(ref(this.db, `tabs/${classCode}/${UUID}/${tab.id}`), tab)
            .then(() => console.log("Tab updated"));
    }

    updateActiveTab = (classCode: string, UUID: string, tab: Tab) => {
        update(ref(this.db, `tabs/${classCode}/${UUID}/${tab.id}`), {
            index: tab.index,
            windowId: tab.windowId,
            lastActivated: Date.now()
        }).then(() => console.log("Active tab updated"));
    }

    removeTab = (classCode: string, UUID: string, tabId: string) => {
        remove(ref(this.db, `tabs/${classCode}/${UUID}/${tabId}`))
            .then(() => console.log("Remove tab"));
    }

    /**
     * Upload the latest follower screenshot to firebase.
     * @param base64 A base64 string of the active screen capture.
     * @param classCode A string representing the class a user is registered to.
     * @param followerId A string representing the unique ID of a follower.
     */
    uploadScreenshot = (base64: string, classCode: string, followerId: string) => {
        const screenshotRef = storageRef(this.storage, `${this.webFollowerRef}/${classCode}/${followerId}`);
        const followerRef = ref(this.db, `${this.webFollowerRef}/${classCode}/${followerId}/screenshot`);

        uploadString(screenshotRef, base64, 'data_url', {contentType:`image/jpg`})
            .then(() => {
                set(followerRef, new Date().toJSON()).then(() => { console.log('screenshot updated') })
            });
    }

    /**
     * Send the latest ICE candidates to firebase.
     * @param senderId A unique number representing the sender's ID, to differentiate from a reader.
     * @param UUID A string representing the unique ID of a follower.
     * @param data A JSON string object of the latest ICE candidates.
     * @param classCode A string representing the class a user is registered to.
     */
    sendIceCandidates = (senderId: string, UUID: string, data: string, classCode: string) => {
        const msgRef = ref(this.db, `ice/${classCode}/${UUID}`);
        push(msgRef, { sender: senderId, message: data }).then(msg => remove(msg));
    }

    /**
     * Remove an entry from firebase at the specified location.
     * @param {*} classCode A string representing the class a user is registered to.
     * @param {*} uuid A string representing the unique ID of a follower.
     */
    async removeFollower(classCode: string, uuid: string|null) {
        const followerRef = ref(this.db, `/followers/${classCode}/${uuid}`);
        return await remove(followerRef).then(() => {
            return true;
        }).catch((error) => {
            console.log(error);
            return false;
        });
    }
}

export default Firebase;
