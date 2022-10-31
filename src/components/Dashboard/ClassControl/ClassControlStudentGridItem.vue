<script setup lang="ts">
// @ts-ignore
import { useDashboardStore } from "@/stores/dashboardStore.ts";
let dashboardPinia = useDashboardStore();

import {defineProps, PropType, computed} from 'vue'
// @ts-ignore
import * as REQUESTS from "@/constants/_requests.js";
// @ts-ignore
import { Firebase } from '@/controller';
// @ts-ignore
import * as MODELS from '@/models/index.js';
import Follower from "../../../models/_follower";
import Tab from "../../../models/_tab";


interface tabs {
  name: string
  url: string
  favicon: string
}

const firstThreeTabs = computed(() => {
  return props.follower.tabs ? props.follower.tabs.sort((a: Tab, b: Tab) => { return b.lastActivated - a.lastActivated }).slice(0, 3) : []
})

const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  },
});

function handleMonitorFollowerButton() {
  if (props.follower.monitoring) {
    console.log("Sending webRTC permission message to firebase");
    dashboardPinia.requestIndividualAction(props.follower.getUniqueId(), { type: REQUESTS.MONITORENDED });
  } else {
    props.follower.webRTC.stopFollowerStream(); //stop video call if exists
    dashboardPinia.requestIndividualAction(props.follower.getUniqueId(), { type: REQUESTS.MONITORPERMISSION });
  }
}

function handleMuteFollowerButton() {
  dashboardPinia.requestIndividualAction(props.follower.getUniqueId(), { type: props.follower.muted ? REQUESTS.UNMUTETAB : REQUESTS.MUTETAB, tabs: REQUESTS.SINGLETAB });
  props.follower.muted = !props.follower.muted
}

function handleMuteAllFollowerButton() {
  dashboardPinia.requestIndividualAction(props.follower.getUniqueId(), { type: props.follower.muted ? REQUESTS.UNMUTETAB : REQUESTS.MUTETAB, tabs: REQUESTS.MULTITAB });
  props.follower.muteAll = !props.follower.muteAll
}

function handleVideoButton(action: string) {
  dashboardPinia.requestIndividualAction(props.follower.getUniqueId(), { type: REQUESTS.YOUTUBE, action });
}
</script>

<template>
  <div class="w-48" :id="follower.getUniqueId()">
    <div class="h-28 flex flex-col bg-gray-active-student border-2 border-navy-side-menu rounded-t-sm">
      <div class="h-9 bg-white flex items-center">
        <input name="test" type="checkbox" class="h-5 w-5 mx-2">
        <label for="test" class="text-sm text-black">{{ follower.name }}</label>
      </div>
      <div v-for="(tab, index) in firstThreeTabs" class="py-1" :id="index">
        <div class="flex flex-row px-2 items-center">
          <img class="flex-shrink-0 w-4 h-4 mr-2" :src="tab.favicon" />
          <span class="overflow-ellipsis whitespace-nowrap overflow-hidden">{{ tab.url }}</span>
        </div>
      </div>
    </div>
    <div class="h-12 bg-navy-side-menu rounded-b-sm flex">
      <button class="w-full flex justify-center items-center">
        <img class="w-9 h-5" src="@/assets/img/student-icon-eye.svg" alt="Icon"/>
      </button>
      <div class="h-10 mt-1 w-px bg-white"></div>
      <button class="w-full flex justify-center items-center">
        <img class="w-5 h-3" src="@/assets/img/student-icon-ham-menu.svg" alt="Icon"/>
      </button>
    </div>
  </div>

  <div class="h-36 w-36" :id="follower.getUniqueId()">
    <img :id="`image_${follower.getUniqueId()}`" :src="follower.imageBase64" alt="Follower Screen shot"/>
    <video :id="`video_${follower.getUniqueId()}`" muted autoplay/>
    <button @click="() => { handleMonitorFollowerButton() }">{{ follower.monitoring ? 'Stop Monitoring' : 'Request Monitoring' }}</button>
    <button @click="() => { handleMuteFollowerButton() }">{{ follower.muted ? 'Unmute Tab' : 'Mute Tab' }}</button>
    <button @click="() => { handleMuteAllFollowerButton() }">{{ follower.muteAll ? 'Unmute All Tab' : 'Mute All Tab' }}</button>
    <button @click="() => { handleVideoButton(REQUESTS.VIDEOPLAY) }">Play</button>
    <button @click="() => { handleVideoButton(REQUESTS.VIDEOPAUSE) }">Pause</button>
    <button @click="() => { handleVideoButton(REQUESTS.VIDEOSTOP) }">Stop</button>
  </div>
</template>



