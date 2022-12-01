import Firebase from '../controller/_firebase';
import YoutubeController from "./modules/YoutubeController";
import ScreenController from "./modules/ScreenController";
import { useStorage } from "../hooks/useStorage";

const { getSyncStorage } = useStorage();

//If on a YouTube page create the controller
const youtubeController = location.href.includes("youtube") ? new YoutubeController() : null;
const screenController = new ScreenController();

/**
 * Check if the user is currently in block mode (and that they are in an active session)
 */
const checkBlocked = async () => {
    const follower = await getSyncStorage("follower");
    if(!follower) { return; }

    const blocked = await getSyncStorage("blocked");
    if(blocked) { screenController.determineAction("block"); }
}
await checkBlocked();

/**
 * Currently only receives messages from the popup page. Most functionality should
 * be handled by the background script.
 */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.type) {
            case "check":
                AsyncProcessing(request, request.code).then(sendResponse);
                return true;

            case "disconnect":
                AsyncProcessing(request, request.code, request.uuid).then(sendResponse);
                return true;

            case "screenControl":
                console.log("Screen Controller --- setting action: " + request.action);
                screenController.determineAction(request.action);
                return true;

            case "youtube":
                if(location.href.includes("youtube")) {
                    console.log("Youtube Controller --- setting action: " + request.action);
                    youtubeController?.determineAction(request.action);
                }
                break;

            default:
                console.log("Unknown command");
        }
    }
);

//Check if there is a class with the supplied code
const AsyncProcessing = (request: any, code: string, uuid=null) => {
    return new Promise(resolve => {
        const FIREBASE = new Firebase();

        switch (request.type) {
            case "check":
                FIREBASE.checkForClassroom(code).then((result) => {
                    resolve(result);
                });
                break;

            case "disconnect":
                FIREBASE.removeFollower(code, uuid).then((result) => {
                    resolve(result);
                });
                break;

            default:
                console.log("Unknown command");
        }
    });
}
