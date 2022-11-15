<script setup lang="ts">
import {defineProps, PropType, ref} from "vue";
import Modal from "./Modal.vue";
import Follower from "../../models/_follower";
import * as REQUESTS from "../../constants/_requests";

import {useDashboardStore} from "../../stores/dashboardStore";
import { useWebRTCStore } from "../../stores/webRTCStore";
let dashboardPinia = useDashboardStore();
let webRTCPinia = useWebRTCStore();

const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  }
});

const showMonitorModal = ref(false);

/**
 * Start or stop a monitoring session
 */
function handleMonitorFollowerButton() {
  if (props.follower.monitoring) {
    console.log("Sending webRTC permission message to firebase");
    props.follower.monitoring = false;
    props.follower.permission = null;
    dashboardPinia.requestIndividualAction(props.follower.getUniqueId(), { type: REQUESTS.MONITORENDED });
  } else {
    props.follower.monitoring = true;
    webRTCPinia.stopTracks(props.follower.getUniqueId()); //stop video call if exists
    dashboardPinia.requestIndividualAction(props.follower.getUniqueId(), { type: REQUESTS.MONITORPERMISSION });
  }
}

/**
 * Stop any active monitoring session if the teacher clicks the close button
 */
function cancelMonitor() {
  props.follower.monitoring = false;
  props.follower.permission = null;
  dashboardPinia.requestIndividualAction(props.follower.getUniqueId(), { type: REQUESTS.MONITORENDED });
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button
      class="w-full flex justify-center items-center"
      v-on:click="showMonitorModal = true"
  >
    <img class="w-9 h-5" src="@/assets/img/student-icon-eye.svg" alt="Icon"/>
  </button>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showMonitorModal">
      <template v-slot:header>
        <header class="h-20 px-8 bg-white flex justify-between items-center rounded-t-lg">
          <p class="text-2xl font-bold">Screen Monitoring</p>

          <img
              v-on:click="showMonitorModal = false; cancelMonitor();"
              class="w-4 h-4 cursor-pointer"
              src="@/assets/img/modal-icon-exit.svg"
              alt="Close Icon"
          />
        </header>
      </template>

      <template v-slot:content>
        <div class="w-auto inline-block max-h-monitor-modal mt-7 mx-9">

          <!--Student name tag-->
          <div class="w-auto px-5 h-8 rounded-t-2xl bg-white inline-grid content-center">
            <p class="text-base">{{follower.name}}</p>
          </div>

          <!--Screenshot content-->
          <div v-if="!follower.monitoring" class="w-modal-width-xsm">
            <img class="aspect-video" :id="`image_${follower.getUniqueId()}`" :src="follower.imageBase64 ?? undefined" alt="Follower Screen shot"/>
          </div>

          <!--Monitoring and permission content-->
          <div v-else>
            <!--Waiting for permission-->
            <div v-if="follower.permission !== 'granted'"
                 :class="{
                    'w-modal-width-xsm aspect-video bg-white flex flex-col justify-center items-center' : 'true',
                    'hidden': follower.permission === 'granted'
            }">

              <div v-if="follower.permission === null" class="flex flex-col items-center">
                <img class="mt-20 w-32 xs:w-48" src="@/assets/img/happy_col.png" alt="Computer Icon"/>
                <p class="mb-6 mt-8 text-sm font-bold">Waiting for student permission...</p>
              </div>

              <div v-if="follower.permission === 'connecting'" class="flex flex-col items-center">
                <p class="mt-20 lds-dual-ring-lg" />
                <p class="mb-6 mt-8 text-sm font-bold">Connecting to student...</p>
              </div>

              <div v-if="follower.permission === 'declined'" class="flex flex-col items-center">
                <img class="mt-20 w-32 xs:w-48 rotate-180" src="@/assets/img/happy_col.png" alt="Computer Icon"/>
                <p class="mb-6 mt-8 text-sm font-bold">Student has declined the permission...</p>
              </div>

              <button class="mb-28 w-36 h-11 flex-shrink-0 text-white bg-blue-500 text-base rounded-3xl hover:bg-blue-400"
                      v-on:click="() => { cancelMonitor() }"
              >Cancel</button>
            </div>

            <!--Video content-->
            <div :class="{
                      'hidden': follower.permission !== 'granted'
                     }">
              <video class="w-modal-width-xsm aspect-video"
                     :id="`video_${follower.getUniqueId()}`"
                     muted autoplay
              />
            </div>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <footer class="w-auto inline-block mt-11 mb-8 ml-9 flex flex-row items-center">
          <button
              :class="{
                'w-56 h-11 flex-shrink-0 text-white bg-blue-500 text-base rounded-lg hover:bg-blue-400': true,
                'bg-blue-400': follower.permission !== 'granted' && follower.monitoring,
              }"
              :disabled="!!(follower.permission !== 'granted' && follower.monitoring)"
              v-on:click="() => { handleMonitorFollowerButton() }"
          >{{follower.monitoring ? 'Stop screen share' : 'Request screen share'}}</button>

          <div v-show="follower.permission !== 'granted'" class="has-tooltip">
            <span class="tooltip rounded shadow-lg px-3 py-1 bg-gray-700 rounded-xl text-white ml-2 -mt-8">Student permission is required for real time screen monitoring</span>
            <div class="tooltip h-0 w-0 rotate-180 border-x-8 border-x-transparent border-b-[6px] border-b-gray-700 ml-3.5 -mt-2"></div>

            <img class="w-6 h-6 ml-2.5" src="@/assets/img/icon-help.svg" alt="Help Icon"/>
          </div>
        </footer>
      </template>
    </Modal>
  </Teleport>
</template>

<style>
.tooltip {
  @apply invisible absolute;
}

.has-tooltip:hover .tooltip {
  @apply visible z-50;
}

.lds-dual-ring-lg {
  display: inline-block;
  width: 150px;
  height: 150px;
}
.lds-dual-ring-lg:after {
  content: " ";
  display: block;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 2px solid #182B50;
  border-color: #182B50 transparent #182B50 transparent;
  animation: lds-dual-ring-lg 1.2s linear infinite;
}
@keyframes lds-dual-ring-lg {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>