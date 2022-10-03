import './dashboard.css';
import * as REQUESTS from "../../constants/_requests";
import { Firebase, WebRTC } from '../../controller';
import { Leader } from '../../models';
import Disconnect from '../../assets/img/disconnect.png';

//Initialise the firebase
let firebase = new Firebase();
let leader = null;

//Initialise webrtc
const webRTCPeers = {};

//Selected followers
const selectedFollowers = [];

const startSessionArea = document.getElementById('startSessionArea');
const leaderName = document.getElementById('classroomGenerator');
const classCodeDisplay = document.getElementById('classCodeDisplay');
const endSessionArea = document.getElementById('endSessionArea');

//End a current session
const endSessionBtn = document.getElementById('endSessionBtn');
endSessionBtn.onclick = () => {
    //Notify followers a session is ending and delete database class entry
    firebase.requestAction(leader.getClassCode(), { type: REQUESTS.ENDSESSION });
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
    firebase.classRoomListeners(leader.getClassCode(), followerReponse, followerDisconnected);

    startSessionArea.classList.add("hidden");
    endSessionArea.classList.remove("hidden");
}

//Notify the leader that a follower has disconnected
let followerDisconnected = (id) => {
    console.log(id);
    if (document.getElementById(id) != null) {
        document.getElementById(`image_${id}`).src = Disconnect;
    }
}

//Notify the leader a follower has responded to a request
let followerReponse = (response, id) => {
    switch (response.type) {
        case REQUESTS.CAPTURE:
            updateFollower(response.message, id);
            break;

        case REQUESTS.MONITORPERMISSION:
            monitorRequestResponse(response.message, id);
            break;
        default:
            console.log("Unknown command");
    }
}

//Notify the leader a follower has responded to the monitor request
let monitorRequestResponse = (message, id) => {
    console.log(message);
    console.log(id);

    if (message === "granted") {
        document.getElementById(`video_${id}`).classList.remove("hidden");
        document.getElementById(`image_${id}`).classList += " hidden";

        //start video call with the followers ID reference
        webRTCPeers[id].startFollowerStream();
    } else {
        console.log("User has denied the monitor request");
        document.getElementById(`monitor_${id}`).innerText = "Request Monitor";
    }
}

//add new follower or update an existing one
let updateFollower = (capture, id) => {
    console.log(id);
    if (document.getElementById(id) != null) {
        document.getElementById(`image_${id}`).src = capture;
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
    webRTCPeers[UUID] = webRTC;

    //Create the video holder
    let video = createNewVideoHolder(UUID);
    webRTC.setVideoElement(video);

    let area = document.getElementById("followerContainer");

    let container = document.createElement("div");

    let div = document.createElement("div");
    div.classList += "grid-item";
    div.id = UUID;

    //Create the image holder
    let img = createNewImageHolder(UUID, base64);

    //Create the monitor button
    let monitorButton = createMonitorButtonHolder(UUID, webRTC);

    //Create a mute button
    let muteButton = createMuteButtonHolder(UUID);

    //Create a mute all button
    let muteAllButton = createMuteAllButtonHolder(UUID);

    //Create video controls
    let playButton = createVideoButtonHolder(UUID, "Play", REQUESTS.YOUTUBE, REQUESTS.VIDEOPLAY);
    let pauseButton = createVideoButtonHolder(UUID, "Pause", REQUESTS.YOUTUBE, REQUESTS.VIDEOPAUSE);
    let stopButton = createVideoButtonHolder(UUID, "Stop", REQUESTS.YOUTUBE, REQUESTS.VIDEOSTOP);

    div.append(img, video);

    container.onclick = () => {
        const index = selectedFollowers.indexOf(UUID);

        if (index === -1) {
            selectedFollowers.push(UUID);
            container.classList.add("selectedFollower");
        }
        else {
            selectedFollowers.splice(index, 1);
            container.classList.remove("selectedFollower");
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
let createNewImageHolder = (UUID, base64) => {
    let img = new Image();
    img.id = `image_${UUID}`; //track which follower this belongs to
    img.classList += "screenshotCapture";
    img.src = base64;

    return img;
}

/**
 * Create a new grid item containing a video element.
 * @param {*} id A uuid representing a student entry on firebase 
 * @returns 
 */
let createNewVideoHolder = (UUID) => {
    let video = document.createElement("video");
    video.id = `video_${UUID}`; //track which follower this belongs to
    video.classList += "xrayCapture hidden";

    video.muted = true;
    video.autoplay = true;

    return video;
}

/**
 * Create a button that requests the a follower to share their screen.
 * @returns 
 */
let createMonitorButtonHolder = (UUID, webRTC) => {
    let button = document.createElement("button");
    button.id = `monitor_${UUID}`; //track which follower this button belongs to
    button.innerText = "Request Monitor";

    button.onclick = () => {
        if (button.innerText === "Request Monitor") {
            button.innerText = "Stop Monitor";
            console.log("Sending webRTC permission message to firebase");
            firebase.requestIndividualAction(leader.getClassCode(), UUID, { type: REQUESTS.MONITORPERMISSION });
        } else if (button.innerText === "Stop Monitor") {
            document.getElementById(`video_${UUID}`).classList.add("hidden");
            document.getElementById(`image_${UUID}`).classList.remove("hidden");
            button.innerText = "Request Monitor";
            webRTC.stopFollowerStream(); //stop video call if exists
            firebase.requestIndividualAction(leader.getClassCode(), UUID, { type: REQUESTS.MONITORENDED });
        }
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
    let action = { type: REQUESTS.WEBSITE, value: website.value };

    if (selectedFollowers.length === 0) {
        firebase.requestAction(leader.getClassCode(), action);
    } else {
        sendToSelected(action)
    }
}

/**
 * Send an action to all selected followers.
 * @param {*} action 
 */
const sendToSelected = (action) => {
    selectedFollowers.forEach(follower => {
        firebase.requestIndividualAction(leader.getClassCode(), follower, action);
    });
}
