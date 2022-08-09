import { Firebase, WebRTC } from '../../controller';
import { Follower } from '../../models';

export const connect = async (userCode) => {
    let data = {
        "type": "storage",
        "code": userCode
    }
    chrome.runtime.sendMessage(data, null);

    let firebase = new Firebase();
    let success = await firebase.checkForClassroom(userCode);

    console.log("Success: " + success);

    if(success) {     
        //Inject the video container template into the current page
        fetch(chrome.runtime.getURL('/videoContainer.html')).then(r => r.text()).then(html => {
            document.body.insertAdjacentHTML('beforeBegin', html);
            // not using innerHTML as it would break js event listeners of the page
        });
        
        //Must allow time for the template to be added
        setTimeout(function(){
            let follower = new Follower(userCode, "Placeholder");        
            let webRTC = new WebRTC(firebase.db, document.getElementById("localVideo"), document.getElementById("remoteVideo"));

            webRTC.showMyFace();
            firebase.addFollower(follower);
        }, 2000);
        
    } else {
        console.log("Class not found");
    }
}