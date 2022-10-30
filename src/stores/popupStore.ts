//Store example using pinia
import {defineStore} from "pinia";
import {auth} from 'firebaseui';
import {
    browserLocalPersistence,
    createUserWithEmailAndPassword,
    EmailAuthProvider,
    getAuth,
    setPersistence,
    signOut,
    updateProfile
} from '@firebase/auth'
// @ts-ignore
import {Firebase} from "@/controller";
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
            //todo not picking up the key properly
            //Remove the strange firebase bug from application storage
            //removeLocalStorage("firebase:previous_websocket_failure").then(result => console.log(result));

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
        },

        /**
         * Create the dashboard page and pin it.
         */
        createDashboard() {
            chrome.tabs.create({ pinned: true, url: chrome.runtime.getURL("src/pages/dashboard/dashboard.html") })
                .then(result => console.log(result));
        },

        /**
         * Sign a user up with the supplied password and email. Upon successful registration update the firebase profile
         * with the supplied display name. This is attached to the authentication portion of firebase instead of creating
         * a new user field.
         * @param name
         * @param email
         * @param password
         */
        handleSignup(name: string, email: string, password: string) {
            if (getAuth().currentUser) {
                this.createDashboard();
            } else {
                const auth = getAuth();
                createUserWithEmailAndPassword(auth, email, password)
                    .then(() => {
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

                        this.signupError = error.message;
                    });
            }
        },

        /**
         * Handle the logging in of a teacher through email and password or through an external auth provider
         * id.
         */
        handleLogin() {
            //Create a temp variable to access within the callback options
            const self = this;
            if (getAuth().currentUser) {
                this.createDashboard();
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
                        signInSuccessWithAuthResult: function () {
                            self.createDashboard();
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
                if(data.follower != null) {
                    this.view = "sessionStudent"
                } else {
                    setPersistence(getAuth(), browserLocalPersistence).then(() => {
                        (getAuth().currentUser) ? this.view = "sessionTeacher" : this.view = "login";
                    });
                }
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
            chrome.tabs.query({ currentWindow: true, active: true }, () => {
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

                        //TODO Close the popup window or go to the student session?
                        window.close();
                        // this.view = 'sessionStudent';
                    } else {
                        this.classError = "No Class found";
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
            chrome.storage.sync.get("follower", async (data) => {
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
                    this.removeBlocked();

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

        /**
         * Open the dashboard or switch the view to the dashboard. The dashboard does not have a URL associated with it
         * so when it is created it is pinned. This function checks the pinned tabs and if it does not have a URL then
         * it *should* be the dashboard page.
         */
        viewOrOpenDashboard() {
            chrome.tabs.query({ pinned: true }, ([tab]) => {
                if (tab) {
                    if (tab.id != null && tab.url == null) {
                        chrome.tabs.highlight({tabs: tab.index, windowId: tab.windowId},
                            () => window.close());
                    }
                } else {
                    this.createDashboard();
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