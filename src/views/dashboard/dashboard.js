import './dashboard.css';
import * as REQUESTS from "../../constants/_requests";
import { Firebase, WebRTC } from '../../controller';
import { Leader } from '../../models';
import Disconnect from '../../assets/img/disconnect.png';

//Initialise the firebase
let firebase = new Firebase();
let leader = null;

//Initialise webrtc
const webRTCPeers = [];

const startSessionArea = document.getElementById('startSessionArea');
const leaderName = document.getElementById('classroomGenerator');
const classCodeDisplay = document.getElementById('classCodeDisplay');
const endSessionArea = document.getElementById('endSessionArea');

//End a current session
const endSessionBtn = document.getElementById('endSessionBtn');
endSessionBtn.onclick = () => {
    //Notify followers a session is ending and delete database class entry
    firebase.requestAction(leader.getClassCode(), { type: REQUESTS.ENDSESSION, value: null });
    firebase.removeClass(leader.getClassCode());

    //Remove all generated follower containers
    document.getElementById("followerContainer").replaceChildren();

    //Reset html
    classCodeDisplay.innerHTML = null;
    startSessionArea.classList.remove("hidden");
    endSessionArea.classList.add("hidden");
}

//Register a new classroom
const generateClassRoomBtn = document.getElementById('generatorBtn');
generateClassRoomBtn.onclick = () => {
    leader = new Leader(leaderName.value);
    classCodeDisplay.innerHTML = leader.getClassCode();

    firebase.connectAsLeader(leader);
    firebase.classRoomListeners(leader.getClassCode(), newFollower, followerDisconnected);

    startSessionArea.classList.add("hidden");
    endSessionArea.classList.remove("hidden");
}

//Notify the leader that a follower has disconnected
let followerDisconnected = (id) => {
    console.log(id);
    if (document.getElementById(id) != null) {
        document.getElementById(id).childNodes[0].src = Disconnect;
    }
}

//add listener for new follower
let newFollower = (capture, id) => {
    if (document.getElementById(id) != null) {
        document.getElementById(id).childNodes[0].src = capture;
    } else {
        addNewFollowerArea(capture, id);
    }
}

/**
 * Create a new grid item containing a video element.
 * @param {*} UUID A uuid representing a student entry on firebase 
 */
let addNewFollowerArea = (base64, UUID) => {
    //Create a new peer connection for this follower
    let webRTC = new WebRTC(firebase.db, leader.getClassCode(), UUID)
    webRTCPeers.push(webRTC);

    //Create the video holder
    let video = createNewVideoHolder();
    webRTC.setVideoElement(video);

    let area = document.getElementById("followerContainer");

    let container = document.createElement("div");
    let div = document.createElement("div");
    div.classList += "grid-item";
    div.id = UUID;

    //Create the image holder
    let img = createNewImageHolder(base64);

    //Create the monitor button
    let monitorButton = createMonitorButtonHolder(UUID);

    //Create a mute button
    let muteButton = createMuteButtonHolder(UUID);

    //Create a mute all button
    let muteAllButton = createMuteAllButtonHolder(UUID);

    //Create video controls
    let playButton = createVideoButtonHolder(UUID, "Play", REQUESTS.YOUTUBE, REQUESTS.VIDEOPLAY);
    let pauseButton = createVideoButtonHolder(UUID, "Pause", REQUESTS.YOUTUBE, REQUESTS.VIDEOPAUSE);
    let stopButton = createVideoButtonHolder(UUID, "Stop", REQUESTS.YOUTUBE, REQUESTS.VIDEOSTOP);

    div.append(img, video);

    div.onclick = () => {
        //TODO Request must have been successful first

        if (img.classList.contains("hidden")) {
            img.classList.remove("hidden");
            video.classList += " hidden";

            //stop video call if exists
            webRTC.stopFollowerStream();
            firebase.requestIndividualAction(leader.getClassCode(), UUID, { type: REQUESTS.MONITORENDED });
        } else {
            video.classList.remove("hidden");
            img.classList += " hidden";

            //start video call
            webRTC.startFollowerStream();
        }
    }

    //Add the button on after so it is not included in the onclick
    container.append(div, monitorButton, muteButton, muteAllButton, playButton, pauseButton, stopButton);
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
let createNewVideoHolder = () => {
    let video = document.createElement("video");
    video.classList += "xrayCapture hidden";

    video.muted = true;
    video.autoplay = true;

    return video;
}

/**
 * Create a button that requests the a follower to share their screen.
 * @returns 
 */
let createMonitorButtonHolder = (UUID) => {
    let button = document.createElement("button");
    button.innerText = "Request Monitor";

    button.onclick = () => {
        console.log("Sending webRTC permission message to firebase");
        firebase.requestIndividualAction(leader.getClassCode(), UUID, { type: REQUESTS.MONITORPERMISSION });
    }

    return button;
}

/**
 * Create a button that requests the active tab of a follower is muted.
 * @returns 
 */
let createMuteButtonHolder = (UUID) => {
    let button = document.createElement("button");
    button.innerText = "Mute Tab";

    button.onclick = () => {
        if (button.innerHTML == "Mute Tab") {
            button.innerHTML = "Unmute Tab";
            console.log("Sending mute request to Firebase");
            firebase.requestIndividualAction(leader.getClassCode(), UUID, { type: REQUESTS.MUTETAB, tabs: REQUESTS.SINGLETAB });
        } else {
            button.innerHTML = "Mute Tab";
            console.log("Sending unmute request to Firebase");
            firebase.requestIndividualAction(leader.getClassCode(), UUID, { type: REQUESTS.UNMUTETAB, tabs: REQUESTS.SINGLETAB });
        }
    }

    return button;
}

/**
 * Create a button that requests the active tab of a follower is muted.
 * @returns 
 */
let createVideoButtonHolder = (UUID, text, type, action) => {
    let button = document.createElement("button");
    button.innerText = text;

    button.onclick = () => {
        console.log(`Sending ${text} request to Firebase`);
        firebase.requestIndividualAction(leader.getClassCode(), UUID, { type: type, action: action });
    }

    return button;
}

/**
 * Create a button that requests the active tab of a follower is muted.
 * @returns 
 */
let createMuteAllButtonHolder = (UUID) => {
    let button = document.createElement("button");
    button.innerText = "Mute All Tabs";

    button.onclick = () => {
        if (button.innerHTML == "Mute All Tabs") {
            button.innerHTML = "Unmute All Tabs";
            console.log("Sending mute request to Firebase");
            firebase.requestIndividualAction(leader.getClassCode(), UUID, { type: REQUESTS.MUTETAB, tabs: REQUESTS.MULTITAB });
        } else {
            button.innerHTML = "Mute All Tabs";
            console.log("Sending unmute request to Firebase");
            firebase.requestIndividualAction(leader.getClassCode(), UUID, { type: REQUESTS.UNMUTETAB, tabs: REQUESTS.MULTITAB });
        }
    }

    return button;
}

//send a basic website
const launchURL = document.getElementById('launchURL');
const website = document.getElementById('website');
launchURL.onclick = () => {
    firebase.requestAction(leader.getClassCode(), { type: REQUESTS.WEBSITE });
}
