<script setup lang="ts">
import '../../styles.css'
import { ref } from 'vue'
import * as REQUESTS from "../../constants/_requests.js";
import { Firebase, WebRTC } from '../../controller';
import { Leader } from '../../models';
import Disconnect from '../../assets/img/disconnect.png';
import Follower from "./Follower.vue";

interface followerInterface {
  webRTC: any
  UUID: any
  imageBase64: string
  monitoring: boolean
  muted: boolean
  muteAll: boolean
}

const classCode = ref("")
const followers = ref<followerInterface[]>([])

//Initialise the firebase
let firebase = new Firebase();

const leaderName = ref("")

function endSession () {
  //Notify followers a session is ending and delete database class entry
  classCode.value = ""
  firebase.requestAction(leader.getClassCode(), { type: REQUESTS.ENDSESSION });
  firebase.removeClass(leader.getClassCode());
  followers.value = []
}

//Notify the leader that a follower has disconnected
let followerDisconnected = (id) => {
  console.log(id);
  let follower = followers.value.find(element => element.UUID === id)
  if (!follower) {
    return
  }
  follower.imageBase64 = Disconnect
}

//Notify the leader a follower has responded to a request
let followerResponse = (response, id) => {
  console.log(response, id)
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

  let follower = followers.value.find(element => element.UUID === id)
  if (!follower) {
    return
  }
  if (message === "granted") {
    follower.monitoring = true
    follower.webRTC.setVideoElement(document.getElementById(`video_${follower.UUID}`))
    follower.webRTC.startFollowerStream()
  } else {
    follower.monitoring = false
    console.log("User has denied the monitor request");
  }
}

//add new follower or update an existing one
let updateFollower = (capture, id) => {
  console.log("updateFollower")
  let follower = followers.value.find(element => element.UUID === id)
  console.log(follower)
  if (follower) {
    follower.imageBase64 = capture
  } else {
    addNewFollowerArea(capture, id)
  }
}

/**
 * Create a new grid item containing a video element.
 * @param {*} UUID A uuid representing a student entry on firebase
 */
let addNewFollowerArea = (base64, UUID) => {
  console.log("addNewFollower")
  let webRTC = new WebRTC(firebase.db, leader.getClassCode(), UUID)

  console.log(webRTC)
  let follower:followerInterface = {
    webRTC,
    UUID,
    imageBase64: base64,
    monitoring: false,
    muted: false,
    muteAll: false
  }
  console.log(follower)
  followers.value.push(follower)
  console.log(followers)
}

function generateClass() {
  console.log('generating')
  leader = new Leader(leaderName.value);
  classCode.value = leader.getClassCode()
  console.log(classCode)

  firebase.connectAsLeader(leader);
  firebase.classRoomListeners(leader.getClassCode(), followerResponse, followerDisconnected);
}

function launchWebsite () {
  let action = { type: REQUESTS.WEBSITE, value: webLink.value };
  firebase.requestAction(leader.getClassCode(), action);
}

const webLink = ref("")
var leader: Leader = ref(null)


</script>

<template>
  <div id="dashboard">
    <h1 class="bg-red-500"><i>Dashboard</i> Page</h1>
    <p>src\pages\dashboard\dashboard.html</p>

    <div>
      <h3 id="classCodeDisplay">{{ classCode }}</h3>
    </div>

    <!-- Generating a new classroom -->
    <div id="startSessionArea">
      <form>
        <label for="classroom">Name:</label><br>
        <input type="text" id="classroomGenerator" name="classroom" v-model="leaderName" placeholder="Edward"><br>
      </form>

      <button v-if="!classCode || (classCode && classCode.length === 0)" id="generatorBtn" @click="generateClass">Generate</button>
    </div>

    <!-- Ending a current session -->
    <div v-if="classCode && classCode.length" id="endSessionArea">
      <button id="endSessionBtn" @click="endSession">End Session</button>
    </div>

    <!-- Launching a basic website -->
    <div>
      <form>
        <label for="websiteURL">Website:</label><br>
        <input type="text" id="website" name="websiteURL" v-model="webLink" placeholder="www.lumination.com.au"><br>
      </form>

      <button id="launchURL" @click="launchWebsite">Launch</button>
    </div>

    <!-- Containers to hold the screen shot images -->
    <div id="followerContainer" class="grid-container">
      <follower class="h-36 w-36" v-for="follower in followers" :key="follower.UUID" :follower="follower"/>
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
