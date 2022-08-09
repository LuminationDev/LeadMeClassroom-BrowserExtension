import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

// Below is the configuration for production LeadMe
// NOTE: place this into env before production.
const prodConfig = {
    apiKey: "AIzaSyChbyk9mh9jZrzDgpu4aYtmBSNfIeeV6nQ",
    authDomain: "browserextension-bc94e.firebaseapp.com",
    databaseURL: "https://browserextension-bc94e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "browserextension-bc94e",
    storageBucket: "browserextension-bc94e.appspot.com",
    messagingSenderId: "12541426407",
    appId: "1:12541426407:web:7fd40f96e3b7da8c108042",
    measurementId: "G-JY5GNBKCFY"
};
  
// Below is the configuration for the testing server
const devConfig = {
    apiKey: "AIzaSyChbyk9mh9jZrzDgpu4aYtmBSNfIeeV6nQ",
    authDomain: "browserextension-bc94e.firebaseapp.com",
    databaseURL: "https://browserextension-bc94e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "browserextension-bc94e",
    storageBucket: "browserextension-bc94e.appspot.com",
    messagingSenderId: "12541426407",
    appId: "1:12541426407:web:7fd40f96e3b7da8c108042",
    measurementId: "G-JY5GNBKCFY"
};

const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

class Firebase {
    constructor() {
        try {
            firebase.initializeApp(config);
        } catch (err) {
            if (!/already exists/.test(err.message)) {
                console.error('Firebase initialization error', err.stack);
            }
        }

        //Real-time database reference
        this.db = firebase.database();

        // instantiate global application state object for Chrome Storage and feed in firebase data
        // Chrome Storage will store our global state as a a JSON stringified value.
        this.applicationState = { values: [] };
    }

    /** 
     * updateState is a function that writes the changes to Chrome Storage
    */ 
    updateState = (applicationState) => {
        chrome.storage.local.set({ state: JSON.stringify(applicationState) });
        console.log(JSON.stringify(applicationState));
    }

    /**
     * Create a new room on the real time database
     */
    connectAsLeader = (leader) => {
        let classroom = leader.getClassroomObject();
        this.generateRoom(classroom);
    }

    /**
     * Attempt to find a class code matching the input, return whether the attempt was succesful or not
     */
    async checkForClassroom (inputCode) {
        let data = {"type":"firebase"}

        //Get the real time database reference
        await this.db.ref("/classCode").child(inputCode).get().then((snapshot) => {
            if(snapshot.exists()) {
                data.response = true;      
            } else {
                data.response = false;
                data.value = false;
                chrome.runtime.sendMessage(data, null); 
            }
        }).catch((error) => {
            data.response = false; 
            data.value = false;
            chrome.runtime.sendMessage(data, null); 
        })

        return data.response;
    }

    /**
     * Add a follower object to the classrooms followers array.
     * @param {*} data A Follower object.
     */
    addFollower = (data) => {        
        this.db.ref(`/classCode/${data.getClassCode()}/followers`).update(data.getFollowerObject());
        // this.registerListeners();
    }

    /**
     * Update the Real Time Database with the pass object.
     * @param {*} object A JSON structured object to be uploaded into the database.
     */
    generateRoom = (object) => {
        this.db.ref(`/classCode`).update(object);
    }

    /**
     * Update the Real Time Database with the pass object.
     * @param {*} object A JSON structured object to be uploaded into the database.
     */
    doUpdate = (code, object) => {
        this.db.ref(`/classCode/${code}`).update(object);
    }

    /**
     * Register listeners on the firebase, applying different listeners depending on what type of users
     * has just connected.
     * @param {*} user A string representing if the user is a leader or a follower.
     */
    registerListeners = (user) => {

    }
}

export default Firebase;
