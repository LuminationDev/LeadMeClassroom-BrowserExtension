import './assistant.css';
import { ConnectionManager } from '../../controller';

/**
 * Listens for actions, runs a function depending on the type
 * of action passed.
 */
const assistantListener = (value) => {
    console.log(value);

    switch (value.type) {
        case "website":
            console.log("Launch a website");
            //Send the message to the currently active tab
            chrome.runtime.sendMessage(value);
            break;

        case "monitor":
            console.log("Request monitoring");
            break;

        case "capture":
            console.log("Updating screenshot");
            MANAGER.captureScreen();
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
    chrome.storage.sync.remove("follower", () => {
        console.log("Data removed");
    });
}