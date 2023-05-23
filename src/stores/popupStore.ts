import {defineStore} from "pinia";
import { useStorage } from "../hooks/useStorage";
import Firebase from "../controller/_firebase";
import * as REQUESTS from "../constants/_requests";
import Follower from "../models/_follower";

const { getSyncStorage, setSyncStorage, removeSyncStorage } = useStorage();
const firebase = new Firebase();

interface followerData {
    code: string,
    uuid: string,
    monitoring?: boolean
}

//name - object
export let usePopupStore = defineStore("popup", {
    //Data
    state: () => {
        return {
            view: "loading",
            username: null,
            follower: new Follower(),
            classCode: "",
            error: "",
            name: "",
            previousViews: <string[]>([]),
            justCreatedAccount: false
        };
    },

    //Methods/functions
    actions: {
        /**
         * Change the current panel to the supplied one.
         */
        changeView(panel: string, addToHistory: boolean = true) {
            if (addToHistory) {
                this.previousViews.push(this.view)
            }
            if (panel === 'login' || panel === 'sessionTeacher' || panel === 'sessionStudent') {
                this.previousViews = []
            }
            this.resetStateFields();
            this.view = panel;
        },

        /**
         * Reset any fields that may be used across multiple panels
         */
        resetStateFields() {
            this.error = "";
            this.name = "";
        },

        popPreviousView(): string
        {
            if (this.previousViews.length) {
                return <string>this.previousViews.pop()
            }
            if (this.follower.name != "") {
                return "sessionStudent"
            }
            if (this.name) {
                return "sessionTeacher"
            }
            return "login"
        },

        back() {
            console.log(this.previousViews)
            this.changeView(this.popPreviousView(), false)
        },

        /**
         * Determine whether the top right icon should be visible
         */
        showHeaderIcon() {
            return (
                this.view !== 'loading'
                && this.view !== 'login'
                && this.view !== 'sessionStudent'
                && this.view !== 'sessionTeacher'
            );
        },

        /**
         * Check for an active user when opening the popup.
         */
        onOpen() {
            //Remove the strange firebase bug from application storage
            localStorage.removeItem("firebase:previous_websocket_failure");

            chrome.permissions.contains({
                permissions: ["storage"]
            }, async (granted) => {
                if (granted) {
                    console.log("Checking for follower");
                    await this.checkForFollower();
                } else {
                    console.log("Storage permission is not enabled.");
                }
            });
        },

        /**
         * Check if a student entry exists in local storage and if there is still an active session.
         */
        async checkForFollower() {
            const follower = <followerData>await getSyncStorage("follower");
            if(follower != null) {
                const session = await firebase.checkForClassroom(follower.code);

                if(session) {
                    this.view = "sessionStudent";
                    return;
                } else {
                    await this.handleEndSessionClick();
                }
            }

            this.view = 'login'
        },

        /**
         * Begin the connection process for a student, ask for permissions to be granted at this stage.
         */
        async connect() {
            return await new Promise((resolve, reject) => {
                chrome.permissions.request({
                    permissions: ["tabs", "scripting"]
                }, async (granted: boolean) => {
                    if (granted) {
                        await this.connectToClass(resolve)
                    } else {
                        this.error = "Please accept the permissions when prompted";
                        reject()
                    }
                });
            })
        },

        /**
         * Using the inputted code values check to see if there is a classroom matching these details and then
         * add the student to the class.
         */
        async connectToClass(resolver: any) {
            const userCode = this.classCode;
            const follower = this.follower;

            //Queries the currently open tab and sends a message to it
            localStorage.removeItem("firebase:previous_websocket_failure")
            
            const result = await firebase.checkForClassroom(userCode);

            if (!result) {
                this.error = "No Class found";
                resolver(false);
                return;
            }

            void await setSyncStorage({
                "follower": {
                    "code": userCode,
                    "name": follower.name,
                    "monitoring": false
                }
            });

            chrome.windows.create({
                url: chrome.runtime.getURL("src/pages/assistant/assistant.html"),
                type: "popup",
                state: "minimized"
            }).then(result => {
                console.log(result)
            }).catch(error => {
                console.log(error)
            });

            //Wait for the initial tab list to be sent through before refreshing the tabs
            setTimeout(() => {
                //Reload all inactive tabs as they may not register the extension is now active
                chrome.tabs.query({active: false}, (tabs) => {
                    tabs.forEach(tab => {
                        void chrome.tabs.reload(<number>tab.id);
                    });
                    resolver(true);
                })
            }, 1000)
        },

        /**
         * Handle ending a session for a student, this manages removing the details from the local storage and
         * alerting a teacher that the student has disconnected.
         */
        async handleEndSessionClick() {
            localStorage.removeItem("firebase:previous_websocket_failure");
            const userData:followerData = await getSyncStorage("follower");
            if (userData == null) { return; }

            //Send message to firebase about disconnection
            chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                let activeTab = tabs[0];
                if (activeTab.id == null) { return; }

                chrome.tabs.sendMessage(activeTab.id,
                    {
                        "type": "disconnect",
                        "code": userData.code,
                        "uuid": userData.uuid
                    }, (response) => {
                        console.log(response);
                    }
                );
            });

            //Remove any 'blocking' div from open pages
            this.removeBlocked();

            //Reset the popup view to the login panel
            this.view = 'login';

            removeSyncStorage("follower")
                .then(() => console.log("Data removed"));

            chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([tab]) => {
                if (!tab) { return }

                if (tab.id != null) {
                    chrome.tabs.remove(tab.id).then(result => console.log(result));
                }
            });
        },

        /**
         * Remove the saved block message on sign out for student
         */
        removeBlocked() {
            chrome.runtime.sendMessage({type: REQUESTS.SCREENCONTROL, action: "unblock"})
                .then(result => console.log(result));
        },
    },

    //Computed properties
    getters: {
        test() {
            return 10;
        },
    },
});