import {defineStore} from "pinia";
import { useStorage } from "../hooks/useStorage";
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    getAuth,
    signOut,
    updateProfile, setPersistence, browserLocalPersistence
} from '@firebase/auth'
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

            await setPersistence(getAuth(), browserLocalPersistence);
            const auth = getAuth();
            if (auth && auth.currentUser) {
                this.view = auth.currentUser.emailVerified ? 'sessionTeacher' : 'verifyEmail'
                return
            }
            this.view = 'login'
        },

        async getUserEmail() {
            await setPersistence(getAuth(), browserLocalPersistence);
            const auth = await getAuth();
            return auth.currentUser?.email;
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
        async handleSignup(email: string, password: string, marketing: boolean) {
            if (getAuth().currentUser) {
                this.createDashboard();
                return;
            }

            const auth = getAuth();
            await createUserWithEmailAndPassword(auth, email, password)
                .then((user) => {
                    //Set the display name of the user
                    updateProfile(auth.currentUser!, { displayName: this.name, photoURL: marketing ? Date.now().toString() : null })
                        .catch((err) => console.log(err));
                    sendEmailVerification(user.user)
                        .catch((err) => console.log(err));
                    // Move to sign in
                    this.justCreatedAccount = true
                    this.changeView('loginTeacher');
                })
                .catch((error) => {
                    const errorCode = error.code;
                    console.log(errorCode);

                    this.error = this.getUsefulErrorMessageFromFirebaseCode(error.code)
                });
        },

        /**
         * Handle the logging in of a teacher through email and password or through an external auth provider
         * id.
         */
        async handleLogin(email: string, password: string) {
            if (getAuth().currentUser) {
                if (!getAuth().currentUser?.emailVerified) {
                    this.changeView('verifyEmail')
                } else {
                    this.createDashboard()
                }
                return;
            }

            const auth = getAuth();
                await signInWithEmailAndPassword(auth, email, password)
                    .then(() => {
                        if (!auth.currentUser?.emailVerified) {
                            this.changeView('verifyEmail')
                        } else {
                            this.createDashboard()
                        }
                    })
                    .catch((error) => {
                        this.error = this.getUsefulErrorMessageFromFirebaseCode(error.code)
                    });
        },

        async resendVerificationEmail() {
            const auth = getAuth()
            if (!auth.currentUser) {
                return;
            }

            await sendEmailVerification(auth.currentUser)
                .then()
                .catch((err) => console.log(err));
        },

        /**
         * Send the firebase password reset email off to the supplied user.
         */
        async handlePasswordReset(email: string) {
            const auth = getAuth();
            await sendPasswordResetEmail(auth, email)
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
              case 'auth/email-already-in-use':
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
            localStorage.removeItem("firebase:previous_websocket_failure")
            signOut(getAuth()).then(() => {
                this.view = "login"
            });

            //Close the dashboard if open
            chrome.tabs.query({ pinned: true }, ([dashboard]) => {
                if (!dashboard) { return; }
                if (dashboard.url != null) { return; } // the dashboard has no URL associated with it

                if (dashboard.id != null) {
                    void chrome.tabs.sendMessage(dashboard.id, "EndSession");
                }

                //Create a blank tab if the dashboard is the only tab open
                chrome.tabs.query({windowId: dashboard.windowId}, (tabs) => {
                    if (tabs.length === 1) { chrome.tabs.create({}) }
                });

                chrome.tabs.update({pinned: false}).then(() => {
                    if (dashboard.id != null) { chrome.tabs.remove(dashboard.id); }
                });
            });
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
         * Open the dashboard or switch the view to the dashboard. The dashboard does not have a URL associated with it
         * so when it is created it is pinned. This function checks the pinned tabs and if it does not have a URL then
         * it *should* be the dashboard page.
         */
        viewOrOpenDashboard() {
            chrome.tabs.query({ pinned: true }, ([tab]) => {
                if (tab) {
                    if (tab.id != null && tab.url == null) {
                        chrome.tabs.highlight({tabs: tab.index, windowId: tab.windowId},
                    () => {
                                window.close();
                                //If the dashboard is in a different browser window, focus that window as well.
                                void chrome.windows.update(tab.windowId, { focused: true });
                            }
                        );
                    }
                } else {
                    this.createDashboard();
                }
            });
        },

        /**
         * Send a message to the dashboard page from the popup extension.
         * @param message A string describing the request that is being made.
         */
        SendDashboardMessage(message: string) {
            chrome.tabs.query({ pinned: true }, ([tab]) => {
                if (!tab) { return; }

                if (tab.id != null && tab.url == null) {
                    void chrome.tabs.sendMessage(tab.id, message);
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