import {devConfig, prodConfig, testConfig} from './_service';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { FirebaseStorage, getStorage, ref as storageRef, uploadString, getDownloadURL, deleteObject, listAll } from 'firebase/storage'
import {
    Database,
    getDatabase,
    ref,
    onChildAdded,
    onChildChanged,
    onChildRemoved,
    get,
    set,
    update,
    push,
    onDisconnect,
    remove,
    off
} from 'firebase/database';
import {browserLocalPersistence, getAuth, setPersistence, updateProfile} from "@firebase/auth";
import * as REQUESTS from '../constants/_requests';
import {Follower, Leader, Tab} from "../models";

const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

//Use if testing a new feature, remove before development end
//const config = testConfig;

class Firebase {
    private readonly callback: Function|null;
    private readonly firebase: FirebaseApp|undefined;
    private readonly db: Database;
    private readonly storage: FirebaseStorage;

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
     * Get the display name of the currently active user.
     * @returns {string} A string representing a display name.
     */
    getDisplayName = async () => {
        await setPersistence(getAuth(), browserLocalPersistence);
        return getAuth().currentUser?.displayName;
    }

    /**
     * Update the display name of the currently active user.
     * @param name
     */
    setDisplayName = async (name: string) => {
        await updateProfile(getAuth().currentUser!, {displayName: name})
    }

    /**
     * Update the Real Time Database with the pass object.
     * @param {*} leader An object representing the current leader
     * @param callback
     */
    connectAsLeader(leader: Leader, callback: Function) {
        this.generateRoom(leader, callback);
    }

    /**
     * Add listeners for followers being added and removed to the database
     * @param classCode
     * @param followerResponse
     * @param {*} followerDisconnected
     * @param followerAdded
     * @param readIceCandidate
     */
    followerListeners = (classCode: string, followerResponse: Function, followerDisconnected: Function, followerAdded: Function, readIceCandidate: Function) => {
        const followerRef = ref(this.db, `/followers/${classCode}`);

        onChildAdded(followerRef, (snapshot) => {
            followerAdded(snapshot.val(), snapshot.key)
            let name = snapshot.val().name
            let id = snapshot.key

            const individualRef = ref(this.db, `/followers/${classCode}/${id}`);
            onChildChanged(individualRef, (snapshot) => {
                if (snapshot.key === 'screenshot') {
                    const screenshotRef = storageRef(this.storage, `${classCode}/${id}`);
                    getDownloadURL(screenshotRef).then(url => {
                        followerResponse(url, name, id, snapshot.key);
                    })
                } else {
                    followerResponse(snapshot.val(), name, id, snapshot.key);
                }
            });

            //Add ice listeners
            const iceRef = ref(this.db, `ice/${classCode}/${id}`);
            onChildAdded(iceRef, (snapshot) => {
                readIceCandidate(snapshot, id)
            });
        });

        onChildRemoved(followerRef, (snapshot) => {
            followerDisconnected(snapshot.key);
        });
    }

    /**
     * Add listeners for followers being added and removed to the database
     * @param classCode
     * @param followerTabChanged
     * @param followerTabRemoved
     * @param followerTabsAdded
     */
    tabListeners = (classCode: string, followerTabChanged: Function, followerTabRemoved: Function, followerTabsAdded: Function) => {
        const tabRef = ref(this.db, `/tabs/${classCode}`);

        onChildAdded(tabRef, (snapshot) => {
            followerTabsAdded(snapshot.val(), snapshot.key);
            let followerId = snapshot.key;

            const individualTabRef = ref(this.db, `/tabs/${classCode}/${followerId}`);
            onChildChanged(individualTabRef, (snapshot) => {
                followerTabChanged(snapshot.val(), followerId, snapshot.key);
            });

            onChildRemoved(individualTabRef, (snapshot) => {
                followerTabRemoved(followerId, snapshot.key);
            });
        });
    }

    /**
     * Run through all the student entries within the existing class entry and reattach the listeners that may have
     * been severed when a page reload occurred, loading the students again to the dashboard as well.
     * @param classCode
     * @param followerResponse
     */
    reloadFollowers = (classCode: string, followerResponse: Function) => {
        const followerRef = ref(this.db, `/followers/${classCode}`);
        get(followerRef).then((snapshot) => {
            snapshot.forEach(entry => {
                followerResponse(entry.val().screenshot, entry.val().name, entry.key);
            });
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
     * Add a follower object to the classrooms followers array.
     * @param {*} data A Follower object.
     */
    addFollower = (data: Follower) => {
        const followerRef = ref(this.db, `/followers/${data.getClassCode()}`);
        update(followerRef, data.getFollowerObject()).then(() => console.log("Follower object added"));
        onDisconnect(followerRef).remove().then(() => console.log("Follower object removed"));

        const tabRef = ref(this.db, `/tabs/${data.getClassCode()}`);
        update(tabRef, data.getTabsObject()).then(() => console.log("Tab object added"));
        onDisconnect(tabRef).remove().then(() => console.log("Tab object removed"));
    }

    /**
     * Update a follower's data entry in firebase. Only the fields present in the details object will be updated.
     * @param classCode
     * @param uuid
     * @param details An object holding the fields to update on the follower.
     */
    updateFollower = (classCode: string, uuid: string, details: object) => {
        const followerRef = ref(this.db, `/followers/${classCode}/${uuid}`);
        update(followerRef, details).then(() => console.log("Follower updated"));
    }

    /**
     * Remove an entry from firebase at the specified location.
     * @param {*} classCode 
     * @param {*} uuid 
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

    /**
     * Update the Real Time Database with the pass object.
     * @param {*} leader A JSON structured object to be uploaded into the database.
     * @param callback
     */
    generateRoom = (leader: Leader, callback: Function) => {
        let completedCount = 0
        update(ref(this.db, `classCode`), leader.getClassroomObject()).then(() => {
            completedCount++
        });
        update(ref(this.db, `followers`), leader.getDefaultFollowersObject()).then(() => {
            completedCount++
        });
        update(ref(this.db, `followerMessages`), leader.getDefaultFollowerMessagesObject()).then(() => {
            completedCount++
        });
        update(ref(this.db, `tabs`), leader.getDefaultTabsObject()).then(() => {
            completedCount++
        });
        update(ref(this.db, `ice`), leader.getDefaultIceObject()).then(() => {
            completedCount++
        });
        let runCallback = () => {
           setTimeout(() => {
               if (completedCount === 5) {
                   callback()
               } else {
                   runCallback()
               }
           }, 100)
        }
        runCallback()
    }

    /**
     * Sent from a leader, push an action request to all followers. This could be a video_permission, muteTab etc..
     * @param classCode
     * @param {*} type
     */
    requestAction = async (classCode: string, type: object) => {
        const msg = push(ref(this.db, `classCode/${classCode}/request`), type);
        await remove(msg);
    }

    /**
     * Sent from a leader, push an action request to a particular follower. This could be a video_permission, muteTab etc..
     * @param classCode
     * @param uuid
     * @param {*} type
     */
    requestIndividualAction = async (classCode: string, uuid: string, type: object) => {
        const msg = push(ref(this.db, `followerMessages/${classCode}/${uuid}/request`), type);
        await remove(msg);
    }

    /**
     * Sent from a follower, push an action response to the leader. This could be a video_permission, off task notification etc..
     * @param classCode
     * @param uuid
     * @param action
     */
    sendResponse = (classCode: string, uuid: string, action: object) => {
        set(ref(this.db, `followers/${classCode}/${uuid}/response`), action)
            .then(result => console.log(result));
    }

    /**
     * Register listeners on firebase for a student that has just connected
     * @param {*} classCode A string representing the class a user is registered to.
     * @param uuid
     */
    registerListeners = (classCode: string, uuid: string) => {
        //Listen for group actions
        const groupRef = ref(this.db, `classCode/${classCode}/request`);
        onChildAdded(groupRef, (snapshot) => this.callback?.(snapshot.val()));

        //Listen for individual actions
        const individualRef = ref(this.db, `followerMessages/${classCode}/${uuid}/request`);
        onChildAdded(individualRef, (snapshot) => this.callback?.(snapshot.val()));

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
     * @param uuid
     */
    unregisterListeners = (inputCode: string, uuid: string) => {
        off(ref(this.db, `classCode/${inputCode}/request`));
        off(ref(this.db, `followerMessages/${inputCode}/${uuid}/request`))
        off(ref(this.db, `ice/${inputCode}/${uuid}`));
    }

    /**
     * Upload a screenshot of the followers computer to firebase as a base 64 message under that direct follower's
     * entry.
     * @param {*} inputCode A string representing the class a user is registered to.
     * @param {*} inputUUID A string representing the unique ID of a follower.
     * @param tab
     */
    updateTab = (inputCode: string, inputUUID: string, tab: Tab) => {
        set(ref(this.db, `tabs/${inputCode}/${inputUUID}/${tab.id}`), tab)
            .then(() => console.log("Tab updated"));
    }

    updateActiveTab = (inputCode: string, inputUUID: string, tab: Tab) => {
        update(ref(this.db, `tabs/${inputCode}/${inputUUID}/${tab.id}`), {
            index: tab.index,
            windowId: tab.windowId,
            lastActivated: Date.now()
        }).then(() => console.log("Active tab updated"));
    }

    removeTab = (inputCode: string, inputUUID: string, tabId: string) => {
        remove(ref(this.db, `tabs/${inputCode}/${inputUUID}/${tabId}`))
            .then(() => console.log("Remove tab"));
    }

    /**
     * Remove the entity of a class entry, at the end of a session the details of the connects will be erased.
     * @param {*} classCode 
     */
    removeClass = (classCode: string) => {
        const classRef = ref(this.db, `classCode/${classCode}`);
        const followersRef = ref(this.db, `followers/${classCode}`);
        const followerMessagesRef = ref(this.db, `followerMessages/${classCode}`);
        const tabsRef = ref(this.db, `tabs/${classCode}`);
        const iceRef = ref(this.db, `ice/${classCode}`);
        const screenshotsRef = storageRef(this.storage, `${classCode}`);

        off(classRef);
        off(followersRef);
        off(followerMessagesRef);
        off(tabsRef);
        off(iceRef);

        remove(followersRef)
            .then(function () { console.log("Removed class succeeded.") })
            .catch(function (error) { console.log("Remove failed: " + error.message) });

        remove(followerMessagesRef)
            .then(function () { console.log("Removed class succeeded.") })
            .catch(function (error) { console.log("Remove failed: " + error.message) });

        remove(tabsRef)
            .then(function () { console.log("Removed class succeeded.") })
            .catch(function (error) { console.log("Remove failed: " + error.message) });

        remove(iceRef)
            .then(function () { console.log("Removed class succeeded.") })
            .catch(function (error) { console.log("Remove failed: " + error.message) });

        remove(classRef)
            .then(function () { console.log("Removed class succeeded.") })
            .catch(function (error) { console.log("Remove failed: " + error.message) });

        // unfortunately we can't just delete the directory, we have to delete each item within it individually
        listAll(screenshotsRef).then((res) => {
            res.items.forEach(screenshotRef => {
                deleteObject(screenshotRef)
                    .then(function () { console.log("Removed class succeeded.") })
                    .catch(function (error) { console.log("Remove failed: " + error.message) });
            })
        })

    }

    /**
     * Add a follower object to the classrooms followers array.
     * @param base64
     * @param classCode
     * @param followerId
     */
    uploadScreenshot = (base64: string, classCode: string, followerId: string) => {
        const screenshotRef = storageRef(this.storage, `${classCode}/${followerId}`);
        const followerRef = ref(this.db, `followers/${classCode}/${followerId}/screenshot`);

        uploadString(screenshotRef, base64, 'data_url', {contentType:`image/jpg`})
            .then(snapshot => {
                set(followerRef, new Date().toJSON()).then(() => { console.log('screenshot updated') })
            });
    }

    /**
     * Send the latest ICE candidates to firebase.
     * @param senderId
     * @param UUID
     * @param data
     * @param classCode
     */
    sendIceCandidates = (senderId: number, UUID: string, data: object, classCode: string) => {
        const msgRef = ref(this.db, `ice/${classCode}/${UUID}`);
        push(msgRef, { sender: senderId, message: data }).then(msg => remove(msg));
    }
}

export default Firebase;
