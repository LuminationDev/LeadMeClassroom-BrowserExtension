import { Firebase } from '../controller';

/**
 * Currently only receives messages from the popup page. Most functionality should
 * be handled by the background script.
 */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.type === "check" ) {
            AsyncProcessing(request.code).then(sendResponse);
        }

        return true;
    }
);

//Check if there is a class with the supplied code
const AsyncProcessing = (code) => {
    return new Promise(resolve => {
        const FIREBASE = new Firebase();
        FIREBASE.checkForClassroom(code).then((result) => {
            resolve(result);
        });
    });
}
