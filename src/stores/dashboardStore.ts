import { defineStore } from "pinia";
// @ts-ignore
import * as REQUESTS from "@/constants/_requests.js";
// @ts-ignore
import { Firebase, WebRTC } from '@/controller/index.js';
import Disconnect from '@/assets/img/disconnect.png';
// @ts-ignore
import * as MODELS from '@/models/index.js';

const { Leader } = MODELS.default;

interface followerInterface {
  webRTC: any
  UUID: any
  imageBase64: string
  monitoring: boolean
  muted: boolean
  muteAll: boolean
}

export let useDashboardStore = defineStore("dashboard", {
    state: () => {
        return {
            firebase: new Firebase(),
            classCode: "",
            leaderName: "Edward",
            followers: <followerInterface[]>([]),
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
            this.firebase.classRoomListeners(
                this.leader.getClassCode(),
                this.followerResponse,
                this.followerDisconnected
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
         * Create a new grid item containing a video element.
         * @param base64 A base64 string representing the initial screen capture from a student device
         * @param {*} UUID A uuid representing a student entry on firebase
         */
        addNewFollowerArea(base64: string, UUID: string) {
            console.log("addNewFollower")
            let webRTC = new WebRTC(this.firebase.db, this.leader.getClassCode(), UUID)

            console.log(webRTC)
            let follower:followerInterface = {
                webRTC,
                UUID,
                imageBase64: base64,
                monitoring: false,
                muted: false,
                muteAll: false
            }
            console.log(follower)
            this.followers.push(follower)
            console.log(this.followers)
        },

        /**
         * Notify the leader a follower has responded to a request
         * @param response
         * @param id
         */
        followerResponse(response: string, id: string) {
            console.log(response, id)

            switch ((response as any).type) {
                case REQUESTS.CAPTURE:
                    this.updateFollower((response as any).message, id);
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
         * @param id
         */
        updateFollower(capture: string, id: string) {
            console.log("updateFollower")
            let follower = this.followers.find(element => element.UUID === id)
            console.log(follower)
            if (follower) {
                follower.imageBase64 = capture
            } else {
                this.addNewFollowerArea(capture, id)
            }
        },

        /**
         * Notify the leader that a follower has disconnected
         * @param id
         */
        followerDisconnected(id: string) {
            console.log(id);
            let follower = this.followers.find(element => element.UUID === id)
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
