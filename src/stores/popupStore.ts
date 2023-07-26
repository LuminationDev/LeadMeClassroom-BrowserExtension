import {defineStore} from "pinia";
import { useStorage } from "../hooks/useStorage";
import Firebase from "../controller/_firebase";
import * as REQUESTS from "../constants/_requests";
import Follower from "../models/_follower";
import { Task } from "../models";
import {followerData, taskData} from "../constants/_dataTypes";

const { getSyncStorage, setSyncStorage, removeSyncStorage } = useStorage();
const firebase = new Firebase();

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
            justCreatedAccount: false,
            teacherName: <string>'',
            tasks: <Task[]>[]
        };
    },

    //Methods/functions
    actions: {
        /**
         * Change the current panel to the supplied one.
         */
        changeView(panel: string) {
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
                    await this.checkForLocalTasks();
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
                console.log(follower);

                //Update the follower object to the saved one
                this.follower = new Follower(follower.code, follower.name, follower.teacherName, follower.uuid);
                const session = await firebase.checkForWebFollower(follower.code, follower.uuid);

                if(session) {
                    this.teacherName = follower.teacherName;
                    this.view = "sessionStudent";
                    return;
                } else {
                    await this.handleEndSessionClick();
                }
            }

            this.view = 'login'
        },

        /**
         * Check the sync storage for saved tasks and populate the local tasks array if found.
         */
        async checkForLocalTasks() {
            const savedData: string | undefined = await getSyncStorage("tasks");
            console.log(savedData);
            if(savedData !== undefined) {
                const savedTaskList: taskData[] = JSON.parse(savedData);
                const convertedData: Task[] = savedTaskList.map((savedTaskList: taskData) => new Task(savedTaskList.name, savedTaskList.packageName, savedTaskList.type));

                if(convertedData.length !== 0) {
                    this.tasks = convertedData;
                }
            }
        },

        /**
         * Collect the details of a class (I.e. Teachers name) from firebase that is linked to the supplied class
         * code.
         */
        async collectClassroomDetails(): Promise<boolean> {
            const result = await firebase.collectClassDetails(this.classCode);

            if(result === null) {
                this.error = "Could not find class. Check the room code and try again."
                return false;
            } else {
                this.teacherName = result;
                return true;
            }
        },

        /**
         * Begin the connection process for a follower, ask for permissions to be granted at this stage.
         * @param name A string of the name inputted by the follower.
         */
        async connect(name: string) {
            return await new Promise((resolve, reject) => {
                chrome.permissions.request({
                    permissions: ["tabs", "scripting"]
                }, async (granted: boolean) => {
                    if (granted) {
                        await this.connectToClass(name, resolve)
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
        async connectToClass(name: string, resolver: any) {
            this.follower.name = name;
            this.follower.classCode = this.classCode;
            this.follower.teacherName = this.teacherName;

            //Queries the currently open tab and sends a message to it
            localStorage.removeItem("firebase:previous_websocket_failure")
            
            const result = await firebase.checkForClassroom(this.classCode);

            if (!result) {
                this.error = "No Class found";
                resolver(false);
                return;
            }

            void await setSyncStorage({
                "follower": {
                    "code": this.follower.getClassCode(),
                    "name": this.follower.getName(),
                    "uuid": this.follower.getUniqueId(),
                    "teacherName": this.follower.getTeacherName(),
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
         * Change the followers name, changes it in firebase and updates the Leader's data.
         */
        async changeName(name: string) {
            const userData:followerData = await getSyncStorage("follower");
            if (userData == null) { return; }

            await firebase.updateName(userData.code, userData.uuid, name);

            this.follower.name = name;

            void await setSyncStorage({
                "follower": {
                    "code": this.follower.getClassCode(),
                    "name": this.follower.getName(),
                    "uuid": this.follower.getUniqueId(),
                    "teacherName": this.follower.getTeacherName(),
                    "monitoring": false
                }
            });
        },

        /**
         * Handle ending a session for a student, this manages removing the details from the local storage and
         * alerting a teacher that the student has disconnected.
         */
        async handleEndSessionClick() {
            localStorage.removeItem("firebase:previous_websocket_failure");

            removeSyncStorage("tasks")
                .then(() => console.log("Task data removed"));

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
                .then(() => console.log("Follower data removed"));

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
    }
});
