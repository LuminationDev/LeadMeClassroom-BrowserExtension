<script setup lang="ts">
import '../../styles.css'
import { ref, defineProps } from 'vue'
// todo - tidy up and typescript these imports
import * as REQUESTS from "../../constants/_requests.js";
import { Firebase } from '../../controller';
import { Leader } from '../../models';

interface followerInterface {
  webRTC: any
  UUID: any
  imageBase64: string
  monitoring: boolean
  muted: boolean
  muteAll: boolean
}

defineProps<{
  follower: followerInterface
}>()

//Initialise the firebase
let firebase = new Firebase();

function handleMonitorFollowerButton() {
  if (props.follower.monitoring) {
    console.log("Sending webRTC permission message to firebase");
    firebase.requestIndividualAction(leader.getClassCode(), props.follower.UUID, { type: REQUESTS.MONITORENDED });
  } else {
    props.follower.webRTC.stopFollowerStream(); //stop video call if exists
    firebase.requestIndividualAction(leader.getClassCode(), props.follower.UUID, { type: REQUESTS.MONITORPERMISSION });
  }
}

function handleMuteFollowerButton() {
  firebase.requestIndividualAction(leader.getClassCode(), props.follower.UUID, { type: props.follower.muted ? REQUESTS.UNMUTETAB : REQUESTS.MUTETAB, tabs: REQUESTS.SINGLETAB });
  props.follower.muted = !props.follower.muted
}

function handleMuteAllFollowerButton() {
  firebase.requestIndividualAction(leader.getClassCode(), props.follower.UUID, { type: props.follower.muted ? REQUESTS.UNMUTETAB : REQUESTS.MUTETAB, tabs: REQUESTS.MULTITAB });
  props.follower.muteAll = !props.follower.muteAll
}

function handleVideoButton(action) {
  firebase.requestIndividualAction(leader.getClassCode(), props.follower.UUID, { type: REQUESTS.YOUTUBE, action });
}

var leader: Leader = ref(null)


</script>

<template>
  <div class="h-36 w-36" :id="follower.UUID">
    <img :id="`image_${follower.UUID}`" :src="follower.imageBase64"/>
    <video :id="`video_${follower.UUID}`" muted autoplay/>
    <button @click="() => { handleMonitorFollowerButton(follower) }">{{ follower.monitoring ? 'Stop Monitoring' : 'Request Monitoring' }}</button>
    <button @click="() => { handleMuteFollowerButton(follower) }">{{ follower.muted ? 'Unmute Tab' : 'Mute Tab' }}</button>
    <button @click="() => { handleMuteAllFollowerButton(follower) }">{{ follower.muteAll ? 'Unmute All Tab' : 'Mute All Tab' }}</button>
    <button @click="() => { handleVideoButton(REQUESTS.VIDEOPLAY) }">Play</button>
    <button @click="() => { handleVideoButton(REQUESTS.VIDEOPAUSE) }">Pause</button>
    <button @click="() => { handleVideoButton(REQUESTS.VIDEOSTOP) }">Stop</button>
  </div>
</template>