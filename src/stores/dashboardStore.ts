import { defineStore } from "pinia";
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

export let useDashboardStore = defineStore("dashboard", {
    state: () => {
        return {
            firebase: firebase,
            classCode: "",
            leaderName: leaderName,
            followers: <Follower[]>([]),
            webLink: "",
            leader: new Leader("Edward"), //load from sync storage??
        }
    },

    actions: {
        /**
         * Generate a new class code for the current session, attaching the necessary listeners to
         * the firebase real-time database.
         */
        generateSession() {
            console.log('generating')
            this.classCode = this.leader.getClassCode()
            console.log(this.classCode)

            this.firebase.connectAsLeader(this.leader);
            this.firebase.followerListeners(
                this.leader.getClassCode(),
                this.followerResponse,
                this.followerDisconnected,
                this.followerAdded
            );
            this.firebase.tabListeners(
                this.leader.getClassCode(),
                this.followerTabChanged,
                this.followerTabRemoved,
                this.followerTabsAdded
            );
        },

        /**
         * Notify followers a session is ending and delete database class entry
         */
        endSession() {
            this.classCode = ""
            this.firebase.requestAction(this.leader.getClassCode(), { type: REQUESTS.ENDSESSION });
            this.firebase.removeClass(this.leader.getClassCode());
            this.followers = []
        },

        /**
         * Notify the leader a follower has responded to a request
         * @param response
         * @param name
         * @param id
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
         * @param name
         * @param id
         */
        followerTabChanged(response: any, followerId: string, key: string) {
            this.updateFollowerTab(new Tab(key, response.name, response.favicon, response.url, response.lastActivated), followerId)
        },

        /**
         * Notify the leader a follower has responded to a request
         * @param response
         * @param name
         * @param id
         */
        followerTabRemoved(followerId: string, key: string) {
            this.removeFollowerTab(followerId, key)
        },

        /**
         * Notify the leader a follower has responded to a request
         * @param response
         * @param name
         * @param id
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
         * @param capture
         * @param name
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
         * @param capture
         * @param name
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
         * @param capture
         * @param name
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
         * @param id
         */
        followerAdded(snapshot: any, id: string) {
            let webRTC = new WebRTC(this.firebase.db, this.leader.getClassCode(), id)
            let follower = new Follower(this.leader.getClassCode(), snapshot.name, id)
            follower.webRTC = webRTC
            follower.monitoring = false
            follower.muted = false
            follower.muteAll = false
            follower.tabs = snapshot.tabs
            this.followers.push(follower)
        },

        /**
         * Notify the leader that a follower has disconnected
         * @param id
         */
        followerDisconnected(id: string) {
            let follower = this.followers.find(element => element.getUniqueId() === id)
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
        launchWebsite() {
            let action = { type: REQUESTS.WEBSITE, value: this.webLink };
            this.firebase.requestAction(this.leader.getClassCode(), action);
        },

        /**
         * Send an action to an individual student.
         * @param UUID
         * @param action
         */
        requestIndividualAction(UUID: string, action: object) {
            this.firebase.requestIndividualAction(this.leader.getClassCode(), UUID, action);
        },
    },

    getters: {

    }
});
