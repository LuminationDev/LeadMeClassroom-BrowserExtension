//Store example using pinia
import { defineStore } from "pinia";
import { auth } from 'firebaseui';
import { getAuth, setPersistence, browserLocalPersistence, signOut, EmailAuthProvider } from '@firebase/auth'
// @ts-ignore
import { Firebase } from "@/controller";
// @ts-ignore
import * as REQUESTS from "@/constants/_requests";

const firebase = new Firebase();

//name - object
export let usePopupStore = defineStore("popup", {
    //Data
    state: () => {
        return {
            view: "login",
            codeValues: ({input1: "", input2: "", input3: "", input4: "" }),
        };
    },

    //Methods/functions
    actions: {
        /**
         * Change the current panel to the supplied one.
         */
        changeView(panel: string) {
            this.view = panel;
        },

        /**
         * Check for an active user when opening the popup.
         */
        onOpen() {
            chrome.permissions.contains({
                permissions: ["storage"]
            }, (granted) => {
                if (granted) {
                    this.checkForFollower();
                } else {
                    console.log("Storage permission is not enabled.");
                }
            });

            setPersistence(getAuth(), browserLocalPersistence).then(() => {
                if (getAuth().currentUser) {
                    this.view = "sessionTeacher"
                } else {
                    this.view = "login"
                }
            });
        },

        /**
         * Handle the logging in of a teacher through email and password or through an external auth provider
         * id.
         */
        handleLogin() {
            if (getAuth().currentUser) {
                chrome.tabs.create({ url: chrome.runtime.getURL("src/pages/dashboard/dashboard.html") })
                    .then(result => console.log(result));
            } else {
                let ui = new auth.AuthUI(getAuth())
                ui.start('#firebaseui-auth-container', {
                    signInOptions: [
                        EmailAuthProvider.PROVIDER_ID
                    ],
                    callbacks: {
                        // @ts-ignore
                        signInFailure(error) {
                            console.log(error);
                            //errorMessage.value = error
                            return false;
                        },
                        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                            chrome.tabs.create({url: chrome.runtime.getURL("src/pages/dashboard/dashboard.html")})
                                .then(result => console.log(result));
                            return false;
                        }
                    }
                });
            }
        },

        /**
         * Sign a teacher out of their currently active session.
         */
        handleLogoutClick() {
            signOut(getAuth()).then(() => {
                this.view = "login"
            });
        },

        /**
         * Check if a student entry exists in local storage.
         */
        checkForFollower() {
            chrome.storage.sync.get("follower", (data) => {
                console.log(data)
                if (data.follower != null) {
                    this.view = "sessionStudent"
                } else {
                    this.view = "login"
                }
            });
        },

        /**
         * Handle the automatic movement between the input for the codes
         */
        handleInput() {

        },

        /**
         * Begin the connection process for a student, ask for permissions to be granted at this stage.
         */
        connect() {
            chrome.permissions.request({
                permissions: [
                    "storage",
                    "tabs",
                    "scripting",
                    "activeTab",
                    "identity"
                ]
            }, (granted: boolean) => {
                console.log(granted);

                // The callback argument will be true if the user granted the permissions.
                if (granted) {
                    console.log("Permissions have been enabled");
                    this.connectToClass();
                } else {
                    console.log("Permissions have been denied");
                    // errorMessage.value = "Permissions have been denied"
                }
            });
        },

        /**
         * Using the inputted code values check to see if there is a classroom matching these details and then
         * add the student to the class.
         */
        connectToClass() {
            const userCode = this.codeValues.input1 + this.codeValues.input2 + this.codeValues.input3 + this.codeValues.input4
            console.log(userCode);
            console.log(this.codeValues);

            //Queries the currently open tab and sends a message to it
            chrome.tabs.query({ currentWindow: true, active: true }, function (tabs: any) {
                firebase.checkForClassroom(userCode).then((result?: any) => {
                    if (result) {
                        chrome.storage.sync.set({
                            "follower":
                                {
                                    "code": userCode
                                }
                        }).then(result => console.log(result));

                        chrome.windows.create({
                            url: chrome.runtime.getURL("src/pages/assistant/assistant.html"),
                            type: "popup",
                            state: "minimized"
                        }).then(result => console.log(result));

                        //TODO Close the popup window or go to the student session?
                        window.close();
                        // this.view = 'sessionStudent';
                    }
                });
            });
        },

        /**
         * Maximise the assistant page for a student.
         */
        handleAssistantClick() {
            chrome.runtime.sendMessage({"type": "maximize"}).then(result => console.log(result));
        },

        /**
         * Handle ending a session for a student, this manages removing the details from the local storage and
         * alerting a teacher that the student has disconnected.
         */
        handleEndSessionClick() {
            chrome.storage.sync.get("follower", (data) => {
                if (data.follower != null) {
                    //Send message to firebase about disconnection
                    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {

                        let activeTab = tabs[0];
                        if (activeTab.id != null) {
                            chrome.tabs.sendMessage(activeTab.id,
                                {
                                    "type": "disconnect",
                                    "code": data.follower.code,
                                    "uuid": data.follower.uuid
                                }, (response) => {
                                    console.log(response);
                                }
                            );
                        }
                    });

                    //Reset the popup view to the login panel
                    this.view = 'login';
                }
            });

            chrome.storage.sync.remove("follower", () => {
                console.log("Data removed");
            });

            chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([tab]) => {
                if (tab) {
                    if (tab.id != null) {
                        chrome.tabs.remove(tab.id).then(result => console.log(result));
                    }
                }
            });
        }
    },

    //Computed properties
    getters: {
        test() {
            return 10;
        },
    },
});