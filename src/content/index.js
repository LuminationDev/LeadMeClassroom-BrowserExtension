import { Firebase } from '../controller';
import YoutubeController from "./modules/YoutubeController";

//If on a youtube page create the controller
const youtubeController = location.href.includes("youtube") ? new YoutubeController() : null;

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

            case "youtube":
                if(location.href.includes("youtube")) {
                    setTimeout(() => {
                        console.log("Youtube Controller --- setting action: " + request.action);
                        youtubeController.determineAction(request.action);
                    }, 1000);
                }
                break;

            default:
                console.log("Unknown command");
        }
    }
);

//Check if there is a class with the supplied code
const AsyncProcessing = (request, code, uuid=null) => {
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
