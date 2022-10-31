import { defineStore } from "pinia";
import { useStorage } from "../hooks/useStorage";
const { getSyncStorage, setSyncStorage, removeSyncStorage } = useStorage();

// @ts-ignore
import * as REQUESTS from "@/constants/_requests.js";
// @ts-ignore
import { Firebase, WebRTC } from '@/controller/index.js';
import Disconnect from '@/assets/img/disconnect.png';
// @ts-ignore
import * as MODELS from '@/models/index.js';
import Follower from "../models/_follower";
import Tab from "../models/_tab";

const { Leader } = MODELS.default;
const firebase = new Firebase();
const leaderName = await firebase.getDisplayName();

/**
 * When the dashboard is first loaded or if the page is refreshed check to see if there was
 * an active class set the necessary details.
 */
async function onLoad() {
    const currentClass = await getSyncStorage("CurrentClass") as string;
    return currentClass ? currentClass : "";
}

const activeCode = await onLoad();

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
            await setSyncStorage({"CurrentClass": this.classCode});
            await this.attachClassListeners(false);
        },

        attachClassListeners(active: boolean) {
            if(this.classCode === "") {
                return;
            }

            this.firebase.connectAsLeader(this.leader);
            this.firebase.followerListeners(
                this.classCode,
                this.followerResponse,
                this.followerDisconnected,
                this.followerAdded
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
            switch (response.type) {
                case REQUESTS.CAPTURE:
                    this.updateFollower(response.message, name, id);
                    break;

                case REQUESTS.MONITORPERMISSION:
                    this.monitorRequestResponse(response.message, id);
                    break;
                default:
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
        updateFollower(capture: string, name: string, id: string) {
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
            let webRTC = new WebRTC(this.firebase.db, this.classCode, id)
            let follower = new Follower(this.classCode, snapshot.name, id)
            follower.webRTC = webRTC
            follower.monitoring = false
            follower.muted = false
            follower.muteAll = false
            follower.tabs = snapshot.tabs
            this.followers.push(follower)
        },

        /**
         * Notify the leader that a follower has disconnected
         * @param UUID A string representing the unique ID of a student.
         */
        followerDisconnected(UUID: string) {
            let follower = this.followers.find(element => element.getUniqueId() === UUID)
            if (!follower) {
                return
            }
            follower.imageBase64 = Disconnect
        },

        /**
         * Notify the leader a follower has responded to the monitor request
         * @param message
         * @param id
         */
        monitorRequestResponse(message: string, id: string) {
            console.log(message);
            console.log(id);

            let follower = this.followers.find(element => element.getUniqueId() === id)
            if (!follower) {
                return
            }
            if (message === "granted") {
                follower.monitoring = true
                follower.webRTC.setVideoElement(document.getElementById(`video_${follower.getUniqueId()}`))
                follower.webRTC.startFollowerStream()
            } else {
                follower.monitoring = false
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
    },

    getters: {

    }
});
