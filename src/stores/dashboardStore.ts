import { defineStore } from "pinia";
import { useStorage } from "../hooks/useStorage";
import * as REQUESTS from "../constants/_requests.js";
import Firebase from '../controller/_firebase';
import { Follower, Leader, Tab } from '../models';
import { useWebRTCStore } from "./webRTCStore";
import { getAuth, sendPasswordResetEmail } from "@firebase/auth";

interface userDetails {
    name: string,
    marketing: string
}

const firebase = new Firebase();
const leaderDetails = <userDetails>await firebase.getDisplayDetails();
const { getSyncStorage, setSyncStorage, removeSyncStorage } = useStorage();

/**
 * When the dashboard is first loaded or if the page is refreshed check to see if there was
 * an active class set the necessary details.
 */
async function onLoad() {
    const currentClass = await getSyncStorage("CurrentClass") as string;
    return currentClass ? currentClass : "";
}

let activeCode = await onLoad();

const toDataURL = (url: string) => fetch(url)
    .then(response =>  response.blob())
    .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    }))

export let useDashboardStore = defineStore("dashboard", {
    state: () => {
        return {
            view: "dashboard",
            accountView: "menu",
            firebase: firebase,
            classCode: activeCode,
            leaderName: leaderDetails.name,
            marketing: <string|null>leaderDetails.marketing,
            followers: <Follower[]>([]),
            webLink: "",
            leader: new Leader(leaderDetails.name),
            webRTCPinia: useWebRTCStore(),
            tasks: <String[]>([])
        }
    },

    actions: {
        /**
         * Change the current panel to the supplied one.
         */
        changeView(panel: string) {
            this.view = panel;
        },

        /**
         * Change the current account panel to the supplied one.
         */
        changeAccountView(panel: string) {
            this.accountView = panel;
        },

        /**
         * Generate a new class code for the current session, attaching the necessary listeners to
         * the firebase real-time database.
         */
        async generateSession() {
            //Remove the strange firebase bug from application storage
            localStorage.removeItem("firebase:previous_websocket_failure")

            console.log('generating')
            //Hold a temporary reference to be checked against saved/new codes
            activeCode = this.leader.getClassCode();

            //Calling before class code can be attached?
            this.firebase.connectAsLeader(<Leader>this.leader, () => { this.attachClassListeners(false )});
            await this.clearTasks();
            await setSyncStorage({"CurrentClass": this.leader.getClassCode()});

            await new Promise(res => setTimeout(res, 200));
            this.classCode = this.leader.getClassCode();
        },

        /**
         * Using callback functions attach listeners to within the firebase real time database.
         * @param active A boolean representing if a class is already running when the screen loads.
         */
        async attachClassListeners(active: boolean) {
            //Do not attach listeners if there is not an active class on creation/load/reload
            if(activeCode === "") { return; }

            //Override the auto generated code if there is a saved one
            this.leader.setClassCode(activeCode);

            //Set up the streaming connection
            this.webRTCPinia.setConnectionDetails(this.sendIceCandidates, activeCode, "leader");

            this.firebase.followerListeners(
                activeCode,
                this.followerResponse,
                this.followerDisconnected,
                this.followerAdded,
                this.readIceCandidate
            );
            this.firebase.tabListeners(
                activeCode,
                this.followerTabChanged,
                this.followerTabRemoved,
                this.followerTabsAdded
            );

            if(!active) { return; }

            this.firebase.reloadFollowers(activeCode, this.followerResponse);
        },

        /**
         * Send WebRTC ice candidates to the Firebase database
         * @param senderId The unique ID of the sender to differentiate between the sender and receiver.
         * @param UUID The unique ID of the student which acts as the database reference location
         * @param data An object that contains the latest ice candidates
         */
        sendIceCandidates(senderId: string, UUID: string, data: string) {
            this.firebase.sendIceCandidates(senderId, UUID, data, this.classCode);
        },

        /**
         * Read the latest ice candidates and send them through to the WebRTC store for further action.
         * @param snapshot A firebase snapshot containing the ice information.
         * @param UUID The unique ID (key) of the student connection in the WebRTC connection objects
         */
        readIceCandidate(snapshot: any, UUID: string) {
            this.webRTCPinia.readIceCandidate(snapshot, UUID)
        },

        /**
         * Notify followers a session is ending and delete database class entry
         */
        async endSession() {
            localStorage.removeItem("firebase:previous_websocket_failure")
            await this.firebase.requestAction(this.classCode, {type: REQUESTS.ENDSESSION});
            this.firebase.removeClass(this.classCode);
            this.followers = [];
            await removeSyncStorage("CurrentClass");
            await this.clearTasks();

            await new Promise(res => setTimeout(res, 200));
            this.classCode = "";
        },

        /**
         * Notify a selected follower that they have been removed from the class.
         */
        async endIndividualSession(UUID: string) {
            await this.firebase.requestIndividualAction(this.classCode, UUID, {type: REQUESTS.REMOVED});
        },

        /**
         * Rename a selected follower
         * @param newName
         * @param UUID
         */
        async renameFollower(newName: string, UUID: string) {
            await this.firebase.updateFollower(this.classCode, UUID, {name: newName});
        },

        /**
         * Notify the leader a follower has responded to a request
         * @param response
         * @param name
         * @param id
         * @param key
         */
        followerResponse(response: any, name: string, id: string, key: string|null) {
            if (key === "screenshot") {
                toDataURL(response).then((result) => {
                    if (typeof result === "string") {
                        this.updateFollowerScreenshot(result, name, id)
                        void this.updateFollowerCaptureFailed(id, false)
                    }
                })
                return
            }
            switch (response.type) {
                case REQUESTS.MONITORPERMISSION:
                    void this.monitorRequestResponse(response.message, id);
                    break;
                case REQUESTS.CAPTURE_FAILED:
                    void this.updateFollowerCaptureFailed(id, true)
                    break;
                default:
                    console.log(response);
                    console.log("Unknown command");
            }
        },

        /**
         * Notify the leader that a follower has disconnected
         * @param UUID A string representing the unique ID of a student.
         */
        followerDisconnected(UUID: string) {
            let follower = this.followers.find(element => element.getUniqueId() === UUID)
            if (!follower) { return }
            follower.disconnected = true;
        },

        /**
         * Notify the leader that a follower has disconnected
         * @param snapshot
         * @param id
         */
        followerAdded(snapshot: any, id: string) {
            let follower = new Follower(this.classCode, snapshot.name, id)
            follower.monitoring = false
            follower.muted = false
            follower.muteAll = false
            follower.tabs = snapshot.tabs
            if (snapshot.screenshot) {
                toDataURL(snapshot.screenshot).then((result) => {
                    if (typeof result === "string") {
                        this.updateFollowerScreenshot(result, snapshot.name, id)
                    }
                })
            }
            const index = this.followers.findIndex(element => element.getUniqueId() === id)
            if (index === -1) {
                this.followers.push(follower)
            } else {
                this.followers.splice(index, 1, follower)
            }

            this.webRTCPinia.createNewConnection(id);
        },

        /**
         * Notify the leader that a follower has disconnected
         * @param UUID A string representing the unique ID of a student.
         */
        removeFollower(UUID: string) {
            let index = this.followers.findIndex(element => element.getUniqueId() === UUID)
            if (index !== -1) {
                this.followers.splice(index, 1)
            }
        },

        /**
         * Notify the leader a follower has responded to a request
         * @param response
         * @param followerId
         * @param key
         */
        followerTabChanged(response: any, followerId: string, key: string) {
            let newTab = new Tab(key, response.index, response.windowId, response.name, response.favicon, response.url, response.lastActivated)
            newTab.audible = response.audible ?? false
            newTab.muted = response.muted ?? false
            this.updateFollowerTab(newTab, followerId)
        },

        /**
         * Notify the leader a follower has responded to a request
         * @param followerId
         * @param key
         */
        followerTabRemoved(followerId: string, key: string) {
            this.removeFollowerTab(followerId, key)
        },

        /**
         * Notify the leader a follower has responded to a request
         * @param response
         * @param followerId
         */
        followerTabsAdded(response: any, followerId: string) {
            let tabs: Array<Tab> = []
            Object.values(response).forEach((tab: any) => {
                if(tab.name === undefined && tab.id === undefined) { return; }

                console.log("adding a tab", JSON.stringify(tab))
                let newTab = new Tab(tab.id, tab.index, tab.windowId, tab.name, tab.favicon, tab.url, tab.lastActivated)
                newTab.audible = tab.audible ?? false
                newTab.muted = tab.muted ?? false
                tabs.push(newTab)
            })
            this.setFollowerTabs(tabs, followerId)
        },

        /**
         * Add new follower or update an existing one
         * @param capture
         * @param name
         * @param id
         */
        updateFollowerScreenshot(capture: string, name: string, id: string) {
            let follower = this.followers.find(element => element.getUniqueId() === id)
            if (follower) {
                follower.imageBase64 = capture
            }
        },

        /**
         * Add new follower or update an existing one
         * @param id
         * @param value
         */
        updateFollowerCaptureFailed(id: string, value: boolean) {
            let follower = this.followers.find(element => element.getUniqueId() === id)
            if (follower) {
                follower.collectingScreenshotFailed = value
            }
        },

        /**
         * Add new follower or update an existing one
         * @param tab
         * @param id
         */
        updateFollowerTab(tab: Tab, id: string) {
            let follower = this.followers.find(element => element.getUniqueId() === id)
            if (follower) {
                follower.updateIndividualTab(tab.id, tab)
            }
        },

        /**
         * Add new follower or update an existing one
         * @param followerId
         * @param id
         */
        removeFollowerTab(followerId: string, id: string) {
            let follower = this.followers.find(element => element.getUniqueId() === followerId)
            if (follower) {
                follower.removeTab(id)
            }
        },

        /**
         * Add new follower or update an existing one
         * @param followerId
         * @param id
         */
        requestDeleteFollowerTab(followerId: string, id: string) {
            let follower = this.followers.find(element => element.getUniqueId() === followerId)
            if (follower) {
                let action = { type: REQUESTS.DELETE_TAB, tabId: id };
                void this.firebase.requestIndividualAction(this.classCode, follower.getUniqueId(), action);
                const index = follower.tabs.findIndex(element => id === element.id)
                if (index !== -1) {
                    follower.tabs[index].closing = true
                }
            }
        },

        /**
         * Add new follower or update an existing one
         * @param followerId
         * @param tabId
         * @param newValue
         */
        requestUpdateMutingTab(followerId: string, tabId: string, newValue: boolean) {
            let follower = this.followers.find(element => element.getUniqueId() === followerId)
            if (follower) {
                let action = { type: newValue ? REQUESTS.MUTETAB : REQUESTS.UNMUTETAB, tabId };
                console.log(action)
                void this.firebase.requestIndividualAction(this.classCode, follower.getUniqueId(), action);
                const index = follower.tabs.findIndex(element => tabId === element.id)
                if (index !== -1) {
                    follower.tabs[index].muting = true
                }
            }
        },

        /**
         * Send a request to a follower that forces the selected tab to be highlighted (viewed)
         * @param followerId
         * @param tab
         */
        requestActiveTab(followerId: string, tab: object) {
            let follower = this.followers.find(element => element.getUniqueId() === followerId)
            if (follower) {
                this.requestIndividualAction(followerId, {type: REQUESTS.FORCEACTIVETAB, tab: tab})
            }
        },

        /**
         * Add new follower or update an existing one
         * @param tabs
         * @param id
         */
        setFollowerTabs(tabs: Tab[], id: string) {
            let follower = this.followers.find(element => element.getUniqueId() === id)
            if (follower) {
                follower.tabs = tabs
            }
        },

        /**
         * Notify the leader a follower has responded to the monitor request
         * @param message
         * @param id
         */
        async monitorRequestResponse(message: string, id: string) {
            let follower = this.followers.find(element => element.getUniqueId() === id)
            if (!follower) { return }

            switch(message){
                case "granted":
                    follower.permission = "connecting";
                    await this.webRTCPinia.startFollowerStream(id);

                    //Wait while the webRTC connections are established in the background
                    setTimeout(() => {
                        // @ts-ignore
                        follower.permission = "granted";
                    }, 750);
                    break;

                case "denied":
                    follower.permission = "denied";
                    console.log("User has denied the monitor request");
                    break;

                case "stopped":
                    follower.permission = "stopped";
                    console.log("The user has stopped the monitoring request");
                    break;
            }
        },

        /**
         * Set the website link in the firebase real-time database that the active students will navigate to.
         */
        async launchWebsite(website: string) {
            let action = { type: REQUESTS.WEBSITE, value: website };
            await this.updateTasks(website);
            await this.firebase.requestAction(this.classCode, action);
        },

        launchWebsiteIndividual(UUID: string, website: string) {
            let action = { type: REQUESTS.WEBSITE, value: website };
            void this.firebase.requestIndividualAction(this.classCode, UUID, action);
        },

        /**
         * Update or create the task array within local storage.
         */
        async updateTasks(task: string) {
            let tasks = await getSyncStorage("tasks");
            let temp = tasks ? JSON.parse(<string>tasks) : [];
            temp.push(task);
            this.tasks = temp;
            await setSyncStorage({"tasks": JSON.stringify(temp)});
        },

        /**
         * Clear the current tasks from the local storage
         */
        clearTasks() {
            removeSyncStorage("tasks").then(() => console.log("Remove tasks"));
            this.tasks = [];
        },

        /**
         * Send an action to all connected students.
         * @param action
         */
        requestAction(action: object) {
            void this.firebase.requestAction(this.classCode, action);
        },

        /**
         * Send an action to an individual student.
         * @param UUID
         * @param action
         */
        requestIndividualAction(UUID: string, action: object) {
            void this.firebase.requestIndividualAction(this.classCode, UUID, action);
        },

        //Account page functions
        /**
         * Send the firebase password reset email off to the supplied user.
         */
        async handlePasswordReset(email: string) {
            const auth = getAuth();
            return await sendPasswordResetEmail(auth, email)
                .then(() => { return "success"; })
                .catch((error) => { return this.getUsefulErrorMessageFromFirebaseCode(error.code); });
        },

        /**
         * Change the password of the currently signed-in user.
         * @param email
         * @param currentPassword
         * @param newPassword
         */
        async changeUserPassword(email: string, currentPassword: string, newPassword: string) {
            const result = await this.firebase.setPassword(email, currentPassword, newPassword);

            if(result === "success") { return result; }
            return this.getUsefulErrorMessageFromFirebaseCode(result);
        },

        getUsefulErrorMessageFromFirebaseCode(error: string) {
            switch (error) {
                case 'auth/email-already-exists':
                    return 'This email is already in use. Try signing in instead.'
                case 'auth/id-token-expired':
                case 'auth/id-token-revoked':
                case 'auth/invalid-id-token':
                    return 'Your login session has expired. Please logout and try again'
                case 'auth/invalid-email':
                case 'auth/user-mismatch':
                    return 'This email is invalid. Please check your email address and try again.'
                case 'auth/invalid-password':
                    return 'This password is invalid. Please check that it is at least 6 characters.'
                case 'auth/user-not-found':
                    return 'No account was found for these login details. Please check your details and try again.'
                case 'auth/wrong-password':
                    return 'This password does not match the login details for this account. Please try again.'
                case 'auth/too-many-requests':
                    return 'Too many attempts have been made to login to this account. Please reset your password or try again later.'
                default:
                    return 'An error has occurred. Please contact support and give them this error code: ' + error
            }
        },

        /**
         * Change the display name for a user within their firebase account, upon success change the locally held store
         * name as well.
         * @param name A string representing the new display name.
         */
        async changeDisplayName(name: string) {
            await this.firebase.setDisplayName(name);
            this.leaderName = name;
        },

        /**
         * Change whether a user has accepted or denied permission to be contacted for marketing purposes.
         * @param preference A boolean representing if they have opted in for marketing.
         */
        async changeMarketingPreference(preference: boolean) {
            this.marketing = <string|null>await this.firebase.setMarketingPreference(preference);
        }
    }
});
