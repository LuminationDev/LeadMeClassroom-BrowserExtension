import { ConnectionManager } from './modules/_connectionManager';

//Maintain a constant reference to Firebase, WebRTC, etc whilst the content script is loaded
const MANAGER = new ConnectionManager();

//TODO need to check if teacher at somepoint?
MANAGER.checkForExistingConnection();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.message === "start" ) {
            MANAGER.connect(request.code);
        }

        if (request.message == "active") {
            let time = new Date().toLocaleTimeString();
            console.log(request + " : " + time);
            MANAGER.checkForExistingConnection();
        }

        if (request.message == "inactive") {
            let time = new Date().toLocaleTimeString();
            console.log(request + " : " + time);
            MANAGER.disconnect();
        }
    }
);