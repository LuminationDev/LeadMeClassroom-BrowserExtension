import './assistant.css';
import { ConnectionManager } from '../../controller';
import * as REQUESTS from "../../constants/_requests";

/**
 * Listens for actions, runs a function depending on the type
 * of action passed.
 */
const assistantListener = (data) => {
    if(data == null) {
        return;
    }

    console.log(data);

    switch (data.type) {
        case REQUESTS.MONITORPERMISSION:
            console.log("Leader has asked follower for permission");
            chrome.runtime.sendMessage({"type" : "maximize"});
            setTimeout(MANAGER.webRTC.prepareScreen, 1000);
            break;

        case REQUESTS.MONITORENDED:
            MANAGER.webRTC.stopFollowerStream();
            break;

        case REQUESTS.CAPTURE:
            console.log("Updating screenshot");
            MANAGER.captureScreen();
            break;

        case REQUESTS.YOUTUBE:
        case REQUESTS.MUTETAB:           
        case REQUESTS.UNMUTETAB:  
        case REQUESTS.WEBSITE:
            chrome.runtime.sendMessage(data);
            break;

        default:
            console.log("Unknown command");
            break;
    }
}

//Listen to actions sent directly from the background script
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request);
        if (sender.tab && sender.tab.url.contains("assistant.html")) {
            return;
        }
        assistantListener(request);
        return true;
    }
);

//Persistant connection to Firebase & WebRTC
const MANAGER = new ConnectionManager(assistantListener);

//Start the connection manager on page load
chrome.storage.sync.get("follower", async (data) => {
    console.log(data);
    MANAGER.connect(data.follower.code);
});


//End a current session
const endSessionBtn = document.getElementById("endSessionBtn");
endSessionBtn.onclick = () => {
    //Send message to firebase that follower has disconnected
    MANAGER.disconnectFollower();

    chrome.storage.sync.remove("follower", () => {
        console.log("Data removed");
    });

    window.open("", "_self");
    window.close();
}