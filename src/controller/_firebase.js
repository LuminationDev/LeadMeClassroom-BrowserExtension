import {devConfig, prodConfig, testConfig} from './_service';
import { initializeApp } from 'firebase/app';
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage'
import {
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
import {browserLocalPersistence, getAuth, setPersistence} from "@firebase/auth";
import * as REQUESTS from '../constants/_requests.js'

//const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

const config = testConfig;

class Firebase {
    constructor(callback) {
        this.callback = callback;
        this.firebase = null;

        try {
            this.firebase = initializeApp(config);
        } catch (err) {
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
     * Update the Real Time Database with the pass object.
     * @param {*} leader An object representing the current leader
     */
    connectAsLeader = (leader) => {
        this.generateRoom(leader);
    }

    /**
     * Add listeners for followers being added and removed to the database
     * @param classCode
     * @param followerResponse
     * @param {*} followerDisconnected
     * @param followerAdded
     */
    followerListeners = (classCode, followerResponse, followerDisconnected, followerAdded, readIceCandidate) => {
        const followerRef = ref(this.db, `/followers/${classCode}`);

        onChildAdded(followerRef, (snapshot) => {
            followerAdded(snapshot.val(), snapshot.key)
            let name = snapshot.val().name
            let id = snapshot.key

            const individualRef = ref(this.db, `/followers/${classCode}/${id}`);
            onChildChanged(individualRef, (snapshot) => {
                followerResponse(snapshot.val(), name, id, snapshot.key);
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
    tabListeners = (classCode, followerTabChanged, followerTabRemoved, followerTabsAdded) => {
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
    reloadFollowers = (classCode, followerResponse) => {
        // todo - use new method and load in the screenshot
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
    async checkForClassroom(inputCode) {
        const classRef = ref(this.db, `/classCode/${inputCode}/classCode`);
        return await get(classRef).then((snapshot) => {
            return snapshot.val() === inputCode;
        }).catch((error) => {
            console.log(error);
            return false;
        });
    }

    /**
     * Attempt to find a follower uuid matching the input, return whether the attempt was successful or not
     */
    async checkForFollower(inputCode, inputUUID) {
        const followerRef = ref(this.db, `/followers/${inputCode}/${inputUUID}`);
        return await get(followerRef).then((snapshot) => {
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
        const followerRef = ref(this.db, `/followers/${data.getClassCode()}`);
        update(followerRef, data.getFollowerObject()).then(() => console.log("Follower object added"));
        onDisconnect(followerRef).remove().then(() => console.log("Follower object removed"));

        const tabRef = ref(this.db, `/tabs/${data.getClassCode()}`);
        update(tabRef, data.getTabsObject()).then(() => console.log("Tab object added"));
        onDisconnect(tabRef).remove().then(() => console.log("Tab object removed"));
    }

    /**
     * Remove an entry from firebase at the specified location.
     * @param {*} classCode 
     * @param {*} uuid 
     */
    async removeFollower(classCode, uuid) {
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
     */
    generateRoom = (leader) => {
        update(ref(this.db, `classCode`), leader.getClassroomObject()).then(() => console.log("Database: Class code updated"));
        update(ref(this.db, `followers`), leader.getDefaultFollowersObject()).then(() => console.log("Database: Follower object updated"));
        update(ref(this.db, `followerMessages`), leader.getDefaultFollowerMessagesObject()).then(() => console.log("Database: Follower messages updated"));
        update(ref(this.db, `tabs`), leader.getDefaultTabsObject()).then(() => console.log("Database: Tab object updated"));
        update(ref(this.db, `ice`), leader.getDefaultIceObject()).then(() => console.log("Database: Ice object updated"));
    }

    /**
     * Sent from a leader, push an action request to all followers. This could be a video_permission, muteTab etc..
     * @param classCode
     * @param {*} type
     */
    requestAction = async (classCode, type) => {
        const msg = push(ref(this.db, `classCode/${classCode}/request`), type);
        await remove(msg);
    }

    /**
     * Sent from a leader, push an action request to a particular follower. This could be a video_permission, muteTab etc..
     * @param classCode
     * @param uuid
     * @param {*} type
     */
    requestIndividualAction = async (classCode, uuid, type) => {
        const msg = push(ref(this.db, `followerMessages/${classCode}/${uuid}/request`), type);
        await remove(msg);
    }

    /**
     * Sent from a follower, push an action response to the leader. This could be a video_permission, off task notification etc..
     * @param classCode
     * @param uuid
     * @param action
     */
    sendResponse = (classCode, uuid, action) => {
        set(ref(this.db, `followers/${classCode}/${uuid}/response`), action)
            .then(result => console.log(result));
    }

    /**
     * Register listeners on firebase for a student that has just connected
     * @param {*} classCode A string representing the class a user is registered to.
     * @param uuid
     */
    registerListeners = (classCode, uuid) => {
        //Listen for group actions
        const groupRef = ref(this.db, `classCode/${classCode}/request`);
        onChildAdded(groupRef, (snapshot) => this.callback(snapshot.val()));

        //Listen for individual actions
        const individualRef = ref(this.db, `followerMessages/${classCode}/${uuid}/request`);
        onChildAdded(individualRef, (snapshot) => this.callback(snapshot.val()));

        //Listen for ice candidates
        const iceRef = ref(this.db, `ice/${classCode}/${uuid}`);
        onChildAdded(iceRef, (snapshot) => {
            snapshot.type = REQUESTS.MONITORDATA;
            this.callback(snapshot);
        });
    }

    /**
     * Unregister any listeners that may be active.
     * @param {*} inputCode A string representing the class a user is registered to.
     * @param uuid
     */
    unregisterListeners = (inputCode, uuid) => {
        off(ref(this.db, `classCode/${inputCode}/request`));
        off(ref(this.db, `followerMessages/${inputCode}/${uuid}/request`))
        off(ref(this.db, `ice/${inputCode}/${uuid}`));
    }

    /**
     * Upload a screenshot of the followers computer to firebase as a base 64 message under that direct follower's
     * entry.
     * @param {*} inputCode A string representing the class a user is registered to.
     * @param {*} inputUUID A string representing the unique ID of a follower.
     * @param base64
     */
    sendScreenShot = (inputCode, inputUUID, base64) => {
        set(ref(this.db, `followers/${inputCode}/${inputUUID}/screenshot`), base64)
            .then(() => console.log("Screen shot sent"));
    }

    /**
     * Upload a screenshot of the followers computer to firebase as a base 64 message under that direct follower's
     * entry.
     * @param {*} inputCode A string representing the class a user is registered to.
     * @param {*} inputUUID A string representing the unique ID of a follower.
     * @param tab
     */
    updateTab = (inputCode, inputUUID, tab) => {
        set(ref(this.db, `tabs/${inputCode}/${inputUUID}/${tab.id}`), tab)
            .then(() => console.log("Tab updated"));
    }

    updateActiveTab = (inputCode, inputUUID, tabId) => {
        set(ref(this.db, `tabs/${inputCode}/${inputUUID}/${tabId}/lastActivated`), Date.now())
            .then(() => console.log("Active tab updated"));
    }

    removeTab = (inputCode, inputUUID, tabId) => {
        remove(ref(this.db, `tabs/${inputCode}/${inputUUID}/${tabId}`))
            .then(() => console.log("Remove tab"));
    }

    /**
     * Remove the entity of a class entry, at the end of a session the details of the connects will be erased.
     * @param {*} classCode 
     */
    removeClass = (classCode) => {
        const classRef = ref(this.db, `classCode/${classCode}`);
        const followersRef = ref(this.db, `followers/${classCode}`);
        const followerMessagesRef = ref(this.db, `followerMessages/${classCode}`);
        const tabsRef = ref(this.db, `tabs/${classCode}`);
        const iceRef = ref(this.db, `ice/${classCode}`);

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
    }

    /**
     * Add a follower object to the classrooms followers array.
     * @param base64
     * @param classCode
     * @param followerId
     */
    uploadScreenshot = (base64, classCode, followerId) => {
        const screenshotRef = storageRef(this.storage, `${classCode}/${followerId}`);
        const followerRef = ref(this.db, `followers/${classCode}/${followerId}/screenshot`);

        uploadString(screenshotRef, base64, 'data_url', {contentType:`image/jpg`})
            .then(snapshot => {
                getDownloadURL(snapshot.ref).then(url => {
                    set(followerRef, url).then(() => console.log("Screenshot updated"))
                })
            });
    }

    /**
     * Send the latest ICE candidates to firebase.
     * @param senderId
     * @param UUID
     * @param data
     * @param classCode
     */
    sendIceCandidates = (senderId, UUID, data, classCode) => {
        const msgRef = ref(this.db, `ice/${classCode}/${UUID}`);
        push(msgRef, { sender: senderId, message: data }).then(msg => remove(msg));
    }
}

export default Firebase;
