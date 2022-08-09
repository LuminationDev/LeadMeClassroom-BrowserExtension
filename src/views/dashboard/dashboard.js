import './dashboard.css';
import { Firebase, WebRTC} from '../../controller';
import { Leader } from '../../models';

//Initialise the firebase
let firebase = new Firebase();
let leader = null;

//Follower list
const activeFollowers = [];

let initiated = false;

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
        addNewVideoArea(snapshot.key);
    });    
}

//add listener for new follower
let newFollowerListener = (id) => {
    firebase.db.ref(`/classCode/${leader.getClassCode()}/followers/${id}`).on('child_changed', snapshot => {
        console.log(snapshot);
    });
}

/**
 * Create a new grid item containing a video element.
 * @param {*} id A uuid representing a student entry on firebase 
 */
let addNewVideoArea = (id) => {
    let area = document.getElementById("videoContainer");

    let div = document.createElement("div");
    div.classList += "grid-item";

    let video = document.createElement("video");
    video.classList += "xrayCapture";
    video.id = id;
    video.muted = true;
    video.autoplay = true;

    let button = document.createElement("button");
    button.id = "monitor";

    div.appendChild(video, button);

    area.appendChild(div);

    //Connect with WebRTC
    let webRTC = new WebRTC(firebase.db, document.getElementById("leader"), document.getElementById(id));

    //Only need to get the stream once
    if(!initiated) {
        webRTC.showMyFace();
        initiated = true;
    }

    console.log("Pausing");

    //Must allow time for the user to approve the connection - add a hook later
    setTimeout(function(){
        //do what you need here
        console.log("Unpausing");
        webRTC.showFriendsFace();
    }, 8000);
}


//send a basic website
const launchURL = document.getElementById('launchURL');
const website = document.getElementById('website');
launchURL.onclick = () => {
    firebase.doUpdate(leader.getClassCode(), {"launchURL" : website.value});
}
