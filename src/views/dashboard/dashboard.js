import './dashboard.css';
import { Firebase, WebRTC} from '../../controller';
import { Leader } from '../../models';

//Initialise the firebase
let firebase = new Firebase();
let leader = null;

//Initialise webrtc
const webRTCPeers = [];

//Follower list
const activeFollowers = [];

//Register a new classroom
const generateClassRoomBtn = document.getElementById('generatorBtn');
const leaderName = document.getElementById('classroomGenerator');
const classCodeDisplay = document.getElementById('classCodeDisplay');
generateClassRoomBtn.onclick = () => {
    leader = new Leader(leaderName.value);
    classCodeDisplay.innerHTML = leader.getClassCode();

    firebase.connectAsLeader(leader);
    
    //Listen for any followers being added
    firebase.db.ref(`/classCode/${leader.getClassCode()}/followers`).on('child_added', snapshot => {
        activeFollowers.push({
            id: snapshot.key,
            value: snapshot.val()
        });
        
        //Create a new follower box each time a follower connects
        console.log("Follower added");
        newFollowerListener(snapshot.key);
    });    
}

//add listener for new follower
let newFollowerListener = (id) => {
    firebase.db.ref(`/classCode/${leader.getClassCode()}/followers/${id}`).on('child_changed', snapshot => {
        console.log(snapshot.val());

        if(snapshot.val().message != null) {
            return;
        }

        if(document.getElementById(id) != null) {
            document.getElementById(id).childNodes[0].src = snapshot.val();
        } else {
            addNewFollowerArea(snapshot.val(), id);
        }
    });
}

/**
 * Create a new grid item containing a video element.
 * @param {*} UUID A uuid representing a student entry on firebase 
 */
let addNewFollowerArea = (base64, UUID) => {
    //Create a new peer connection for this follower
    let webRTC = new WebRTC(firebase.db, leader.getClassCode(), UUID)
    webRTCPeers.push(webRTC);

    let area = document.getElementById("followerContainer");

    let container = document.createElement("div");
    let div = document.createElement("div");
    div.classList += "grid-item";
    div.id = UUID;

    //Create the image holder
    let img = createNewImageHolder(base64);

    //Create the video holder
    let video = createNewVideoHolder(webRTC);

    //Create the monitor button
    let button = createMonitorButtonHolder(webRTC);

    div.append(img, video);

    div.onclick = () => {
        //TODO Request must have been successful first

        if(img.classList.contains("hidden")) {
            img.classList.remove("hidden");
            video.classList += " hidden";

            //stop video call if exists
            webRTC.stopFollowerStream();
        } else {
            video.classList.remove("hidden");
            img.classList += " hidden";

            //start video call
            webRTC.startFollowerStream();
        }
    }

    //Add the button on after so it is not included in the onclick
    container.append(div, button);
    area.appendChild(container);
}

/**
 * Create an image element and set the source with the supplied base64.
 * @param {*} base64 
 * @returns 
 */
let createNewImageHolder = (base64) => {
    let img = new Image();
    img.classList += "screenshotCapture";
    img.src = base64;

    return img;
}

/**
 * Create a new grid item containing a video element.
 * @param {*} id A uuid representing a student entry on firebase 
 * @returns 
 */
let createNewVideoHolder = (webRTC) => {
    let video = document.createElement("video");
    video.classList += "xrayCapture hidden";

    video.muted = true;
    video.autoplay = true;

    webRTC.setupVideo(video);

    return video;
}

/**
 * Create a button that requests the a follower to share their screen.
 * @returns 
 */
let createMonitorButtonHolder = (webRTC) => {
    let button = document.createElement("button");
    button.innerText = "Request Monitor";

    button.onclick = () => {
        console.log("Sending webRTC permission message to firebase");
        webRTC.requestVideoStream();
    }

    return button;
}

//send a basic website
const launchURL = document.getElementById('launchURL');
const website = document.getElementById('website');
launchURL.onclick = () => {
    firebase.doUpdate(leader.getClassCode(), {"launchURL" : {"url" : website.value}});
}
