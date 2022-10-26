//Store example using pinia
import { defineStore } from "pinia";
import { auth } from 'firebaseui';
import {
    getAuth,
    updateProfile,
    setPersistence,
    browserLocalPersistence,
    signOut,
    EmailAuthProvider,
    createUserWithEmailAndPassword
} from '@firebase/auth'
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
            username: null,
            codeValues: ({input1: "", input2: "", input3: "", input4: "" }),
            classError: "",
            signupError: "",
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
         * Determine whether the top right icon should be visible
         */
        showHeaderIcon() {
            return (
                this.view !== 'login'
                && this.view !== 'sessionStudent'
                && this.view !== 'sessionTeacher'
            );
        },

        /**
         * Check for an active user when opening the popup.
         */
        onOpen() {
            chrome.permissions.contains({
                permissions: ["storage"]
            }, (granted) => {
                if (granted) {
                    console.log("Checking for follower");
                    this.checkForFollower();
                } else {
                    console.log("Storage permission is not enabled.");
                }
            });

            //todo this overrides the student view
            setPersistence(getAuth(), browserLocalPersistence).then(() => {
                (getAuth().currentUser) ? this.view = "sessionTeacher" : this.view = "login";
            });
        },

        handleSignup(name: string, email: string, password: string) {
            if (getAuth().currentUser) {
                chrome.tabs.create({ url: chrome.runtime.getURL("src/pages/dashboard/dashboard.html") })
                    .then(result => console.log(result));
            } else {
                const auth = getAuth();
                createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        //Set the display name of the user
                        // @ts-ignore
                        updateProfile(getAuth().currentUser, { displayName: name })
                            .catch((err) => console.log(err));

                        // Move to sign in
                        this.changeView('loginTeacher');
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        console.log(errorCode);

                        const errorMessage = error.message;
                        this.signupError = errorMessage;
                    });
            }
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
                        EmailAuthProvider.PROVIDER_ID,
                    ],
                    callbacks: {
                        // @ts-ignore
                        signInFailure(error) {
                            console.log(error);
                            return false;
                        },
                        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                            // chrome.storage.sync.set({"DisplayName": getAuth().currentUser?.displayName})
                            //     .then(result => console.log(result));

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
                console.log(data);
                (data.follower != null) ? this.view = "sessionStudent" : this.view = "login";
            });
        },

        /**
         * Check that all the inputs are valid
         */
        checkCodeInput() {
            return Object.values(this.codeValues).every(value => !!value);
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
                    this.classError = "Permissions have been denied.";
                }
            });
        },

        /**
         * Using the inputted code values check to see if there is a classroom matching these details and then
         * add the student to the class.
         */
        connectToClass() {
            const userCode = this.codeValues.input1 + this.codeValues.input2 + this.codeValues.input3 + this.codeValues.input4;
            const username = this.username;

            //Queries the currently open tab and sends a message to it
            let success = false;
            chrome.tabs.query({ currentWindow: true, active: true }, function (tabs: any) {
                firebase.checkForClassroom(userCode).then((result?: any) => {
                    if (result) {
                        chrome.storage.sync.set({
                            "follower":
                                {
                                    "code": userCode,
                                    "name": username
                                }
                        }).then(result => console.log(result));

                        chrome.windows.create({
                            url: chrome.runtime.getURL("src/pages/assistant/assistant.html"),
                            type: "popup",
                            state: "minimized"
                        }).then(result => console.log(result));

                        success = true;

                        //TODO Close the popup window or go to the student session?
                        window.close();
                        // this.view = 'sessionStudent';
                    } else {
                        //TODO
                        success = false;
                    }
                });
            });

            //todo above is not awaited so this always triggers
            if(!success) {
                this.classError = "No Class found";
            }
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
        },

        //todo this only ever creates a new dashboard at this point
        viewOrOpenDashboard() {
            chrome.tabs.query({ url: REQUESTS.DASHBOARD_MATCH_URL }, ([tab]) => {
                if (tab) {
                    if (tab.id != null) {
                        // chrome.tabs.remove(tab.id).then(result => console.log(result));

                    }
                } else {
                    chrome.tabs.create({url: chrome.runtime.getURL("src/pages/dashboard/dashboard.html")})
                        .then(result => console.log(result));
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