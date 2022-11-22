//Store example using pinia
import {defineStore} from "pinia";
import { useStorage } from "../hooks/useStorage";
const { getSyncStorage, setSyncStorage, removeSyncStorage, removeLocalStorage } = useStorage();
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    getAuth,
    signOut,
    updateProfile
} from '@firebase/auth'
// @ts-ignore
import {Firebase} from "@/controller";
// @ts-ignore
import * as REQUESTS from "@/constants/_requests";
import Follower from "../models/_follower";

const firebase = new Firebase();

interface followerData {
    code: string,
    uuid: string
}

//name - object
export let usePopupStore = defineStore("popup", {
    //Data
    state: () => {
        return {
            view: "login",
            username: null,
            follower: new Follower(),
            classCode: "",
            error: "",
            name: "",
            loading: false,
            previousViews: <string[]>([])
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
                // @ts-ignore
                return this.previousViews.pop()
            }
            if (this.follower) {
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
         * Check if a student entry exists in local storage.
         */
        async checkForFollower() {
            const follower = await getSyncStorage("follower");
            if(follower != null) {
                this.view = "sessionStudent";
                return;
            }

            getSyncStorage("Teacher").then(result => {
                (result) ? this.view = "sessionTeacher" : this.view = "login";
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
         */
        handleSignup(email: string, password: string) {
            if (getAuth().currentUser) {
                this.createDashboard();
            } else {
                const auth = getAuth();
                createUserWithEmailAndPassword(auth, email, password)
                    .then(() => {
                        //Set the display name of the user
                        // @ts-ignore
                        updateProfile(auth.currentUser, { displayName: this.name })
                            .catch((err) => console.log(err));

                        // Move to sign in
                        this.changeView('loginTeacher');
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        console.log(errorCode);

                        this.error = this.getUsefulErrorMessageFromFirebaseCode(error.code)
                    });
            }
        },

        /**
         * Handle the logging in of a teacher through email and password or through an external auth provider
         * id.
         */
        handleLogin(email: string, password: string) {
            this.loading = true;

            //Create a temp variable to access within the callback options
            const self = this;
            if (getAuth().currentUser) {
                this.createDashboard();
            } else {
                const auth = getAuth();
                signInWithEmailAndPassword(auth, email, password)
                    .then(() => {
                        this.loading = false;
                        setSyncStorage({"Teacher": true})
                            .then(() => self.createDashboard());
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = this.getUsefulErrorMessageFromFirebaseCode(error.code)
                    });
            }
        },

        /**
         * Send the firebase password reset email off to the supplied user.
         */
        handlePasswordReset(email: string) {
            const auth = getAuth();
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    // Password reset email sent!
                    // ..
                })
                .catch((error) => {
                    const errorCode = error.code;
                    console.log(errorCode);

                    this.error = this.getUsefulErrorMessageFromFirebaseCode(error.code)
                });
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
         * Sign a teacher out of their currently active session.
         */
        async handleLogoutClick() {
            await removeSyncStorage("Teacher");

            signOut(getAuth()).then(() => {
                this.view = "login"
            });

            //Close the dashboard if open
            chrome.tabs.query({ pinned: true }, ([tab]) => {
                if (!tab) { return; }
                if (tab.url != null) { return; }

                chrome.tabs.update({pinned: false}).then(() => {
                    if (tab.id != null) { chrome.tabs.remove(tab.id); }
                });
            });
        },

        /**
         * Begin the connection process for a student, ask for permissions to be granted at this stage.
         */
        connect() {
            chrome.permissions.request({
                permissions: [
                    "storage",
                    "tabs",
                    "scripting"
                ]
            }, (granted: boolean) => {
                console.log(granted);

                // The callback argument will be true if the user granted the permissions.
                if (granted) {
                    console.log("Permissions have been enabled");
                    this.connectToClass();
                } else {
                    this.error = "Permissions have been denied.";
                }
            });
        },

        /**
         * Using the inputted code values check to see if there is a classroom matching these details and then
         * add the student to the class.
         */
        async connectToClass() {
            const userCode = this.classCode;
            const follower = this.follower;

            //Queries the currently open tab and sends a message to it
            localStorage.removeItem("firebase:previous_websocket_failure")
            firebase.checkForClassroom(userCode).then((result?: any) => {
                if (result) {
                    setSyncStorage({
                        "follower":
                            {
                                "code": userCode,
                                "name": follower.name,
                                "monitoring": false
                            }
                    }).then(result => console.log(result));

                    chrome.windows.create({
                        url: chrome.runtime.getURL("src/pages/assistant/assistant.html"),
                        type: "popup",
                        state: "minimized"
                    }).then(result => {
                        console.log(result)
                        window.close()
                    });

                    //TODO Close the popup window or go to the student session?
                    // window.close();
                    // this.view = 'sessionStudent';
                } else {
                    this.error = "No Class found";
                }
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
        async handleEndSessionClick() {
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