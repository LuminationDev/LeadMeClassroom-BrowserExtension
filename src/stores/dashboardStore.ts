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

const { Leader } = MODELS.default;
const firebase = new Firebase();
const leaderName = await firebase.getDisplayName();

interface followerInterface {
    name: string,
    webRTC: any
    UUID: any
    imageBase64: string
    monitoring: boolean
    muted: boolean
    muteAll: boolean
}

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
            firebase: firebase,
            classCode: activeCode,
            leaderName: leaderName,
            followers: <followerInterface[]>([]),
            leader: new Leader(leaderName),
        }
    },

    actions: {
        /**
         * Generate a new class code for the current session, attaching the necessary listeners to
         * the firebase real-time database.
         */
        async generateSession() {
            console.log('Generating new session');
            this.classCode = this.leader.getClassCode();
            await setSyncStorage({"CurrentClass": this.classCode});
            await this.attachClassListeners(false);
        },

        /**
         * Attach listeners to the real-time database to listen for incoming students
         */
        attachClassListeners(active: boolean) {
            if(this.classCode === "") {
                return;
            }

            this.firebase.connectAsLeader(this.leader);
            this.firebase.classRoomListeners(
                this.classCode,
                this.followerResponse,
                this.followerDisconnected
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
         */
        followerResponse(response: string, name: string, id: string) {
            switch ((response as any).type) {
                case REQUESTS.CAPTURE:
                    this.updateFollower((response as any).message, name, id);
                    break;

                case REQUESTS.MONITORPERMISSION:
                    this.monitorRequestResponse((response as any).message, id);
                    break;

                default:
                    console.log("Unknown command");
            }
        },

        /**
         * Add new follower or update an existing one
         * @param capture
         * @param name
         * @param id
         */
        updateFollower(capture: string, name: string, id: string) {
            let follower = this.followers.find(element => element.UUID === id);
            (follower) ? follower.imageBase64 = capture : this.addNewFollowerArea(capture, name, id);
        },

        /**
         * Create a new grid item containing a video element.
         * @param base64 A base64 string representing the initial screen capture from a student device
         * @param username
         * @param {*} UUID A uuid representing a student entry on firebase
         */
        addNewFollowerArea(base64: string, username: string, UUID: string) {
            console.log("Adding new follower");
            let webRTC = new WebRTC(this.firebase.db, this.classCode, UUID);
            let follower:followerInterface = {
                name: username,
                webRTC,
                UUID,
                imageBase64: base64,
                monitoring: false,
                muted: false,
                muteAll: false
            }
            this.followers.push(follower);
        },

        /**
         * Notify the leader that a follower has disconnected
         * @param UUID A string representing the unique ID of a student.
         */
        followerDisconnected(UUID: string) {
            let follower = this.followers.find(element => element.UUID === UUID);
            if (!follower) { return }
            follower.imageBase64 = Disconnect;
        },

        /**
         * Notify the leader a follower has responded to the monitor request
         * @param message
         * @param id
         */
        monitorRequestResponse(message: string, id: string) {
            console.log(message);
            console.log(id);

            let follower = this.followers.find(element => element.UUID === id)
            if (!follower) {
                return
            }
            if (message === "granted") {
                follower.monitoring = true
                follower.webRTC.setVideoElement(document.getElementById(`video_${follower.UUID}`))
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
