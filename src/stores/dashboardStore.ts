import { defineStore } from "pinia";
import { useStorage } from "../hooks/useStorage";
const { getSyncStorage, setSyncStorage, removeSyncStorage } = useStorage();

// @ts-ignore
import * as REQUESTS from "@/constants/_requests.js";
// @ts-ignore
import { Firebase } from '@/controller/index.ts';
// @ts-ignore
import * as MODELS from '@/models/index.ts';
import { Follower, Tab, Leader } from '../models'
const firebase = new Firebase();
const leaderName = await firebase.getDisplayName();

import { useWebRTCStore } from "./webRTCStore";

/**
 * When the dashboard is first loaded or if the page is refreshed check to see if there was
 * an active class set the necessary details.
 */
async function onLoad() {
    const currentClass = await getSyncStorage("CurrentClass") as string;
    return currentClass ? currentClass : "";
}

const activeCode = await onLoad();

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
            firebase: firebase,
            classCode: activeCode,
            leaderName: leaderName,
            followers: <Follower[]>([]),
            webLink: "",
            leader: new Leader(leaderName),
            webRTCPinia: useWebRTCStore(),
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
         * Generate a new class code for the current session, attaching the necessary listeners to
         * the firebase real-time database.
         */
        async generateSession() {
            console.log('generating')
            this.classCode = this.leader.getClassCode()
            this.firebase.connectAsLeader(this.leader);
            await setSyncStorage({"CurrentClass": this.classCode});
            await this.attachClassListeners(false);

            // @ts-ignore
            this.webRTCPinia.setConnectionDetails(this.sendIceCandidates, this.classCode, "leader");
        },

        /**
         * Send WebRTC ice candidates to the Firebase database
         * @param senderId The unique ID of the sender to differentiate between the sender and receiver.
         * @param UUID The unique ID of the student which acts as the database reference location
         * @param data An object that contains the latest ice candidates
         */
        sendIceCandidates(senderId: number, UUID: string, data: object) {
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

        async attachClassListeners(active: boolean) {
            //Override the auto generated code if there is a saved one
            if(this.classCode === "") {
                return;
            } else {
                this.leader.setClassCode(this.classCode);
            }

            this.firebase.followerListeners(
                this.classCode,
                this.followerResponse,
                this.followerDisconnected,
                this.followerAdded,
                this.readIceCandidate
            );
            this.firebase.tabListeners(
                this.classCode,
                this.followerTabChanged,
                this.followerTabRemoved,
                this.followerTabsAdded
            );

            if(!active) {
                return;
            }

            this.firebase.reloadFollowers(this.classCode, this.followerResponse);
        },

        /**
         * Notify followers a session is ending and delete database class entry
         */
        async endSession() {
            this.firebase.requestAction(this.classCode, { type: REQUESTS.ENDSESSION });
            this.firebase.removeClass(this.classCode);
            this.classCode = ""
            this.followers = [];
            await removeSyncStorage("CurrentClass");
        },

        /**
         * Notify the leader a follower has responded to a request
         * @param response
         * @param name
         * @param id
         * @param key
         */
        followerResponse(response: any, name: string, id: string, key: string) {
            if (key === "screenshot") {
                toDataURL(response).then((result) => {
                    if (typeof result === "string") {
                        this.updateFollowerScreenshot(result, name, id)
                    }
                })
                return
            }
            switch (response.type) {
                case REQUESTS.MONITORPERMISSION:
                    this.monitorRequestResponse(response.message, id);
                    break;
                default:
                    console.log(response);
                    console.log("Unknown command");
            }
        },

        /**
         * Notify the leader a follower has responded to a request
         * @param response
         * @param followerId
         * @param key
         */
        followerTabChanged(response: any, followerId: string, key: string) {
            this.updateFollowerTab(new Tab(key, response.name, response.favicon, response.url, response.lastActivated), followerId)
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
                console.log("adding a tab", JSON.stringify(tab))
                tabs.push(new Tab(tab.id, tab.name, tab.favicon, tab.url, tab.lastActivated))
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
                this.firebase.requestIndividualAction(this.classCode, follower.getUniqueId(), action);
                const index = follower.tabs.findIndex(element => id === element.id)
                if (index !== -1) {
                    follower.tabs[index].closing = true
                }
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
        followerDisconnected(UUID: string) {
            let follower = this.followers.find(element => element.getUniqueId() === UUID)
            if (!follower) { return }
            follower.disconnected = true;
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
         * Notify the leader a follower has responded to the monitor request
         * @param message
         * @param id
         */
        async monitorRequestResponse(message: string, id: string) {
            let follower = this.followers.find(element => element.getUniqueId() === id)
            if (!follower) { return }

            if (message === "granted") {
                follower.permission = "connecting";
                await this.webRTCPinia.startFollowerStream(id);

                //Wait while the webRTC connections are established in the background
                setTimeout(() => {
                    // @ts-ignore
                    follower.permission = "granted";
                }, 750);
            } else {
                follower.permission = "declined";
                console.log("User has denied the monitor request");
            }
        },

        /**
         * Set the website link in the firebase real-time database that the active students will navigate to.
         */
        launchWebsite(website: string) {
            let action = { type: REQUESTS.WEBSITE, value: website };
            this.firebase.requestAction(this.classCode, action);
        },

        launchWebsiteIndividual(UUID: string, website: string) {
            let action = { type: REQUESTS.WEBSITE, value: website };
            this.firebase.requestIndividualAction(this.classCode, UUID, action);
        },

        /**
         * Send an action to all connected students.
         * @param action
         */
        requestAction(action: object) {
            this.firebase.requestAction(this.classCode, action);
        },

        /**
         * Send an action to an individual student.
         * @param UUID
         * @param action
         */
        requestIndividualAction(UUID: string, action: object) {
            this.firebase.requestIndividualAction(this.classCode, UUID, action);
        },
    }
});
