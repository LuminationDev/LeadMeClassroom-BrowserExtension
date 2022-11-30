<script setup lang="ts">
import {defineProps, PropType, ref} from "vue";
import Modal from "./Modal.vue";
import Follower from "../../models/_follower";
import * as REQUESTS from "../../constants/_requests";

import {useDashboardStore} from "../../stores/dashboardStore";
import { useWebRTCStore } from "../../stores/webRTCStore";
import Tooltip from "../Buttons/Tooltip.vue";
let dashboardPinia = useDashboardStore();
let webRTCPinia = useWebRTCStore();

const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  }
});

const showMonitorModal = ref(false);

defineExpose({
  initiateMonitoring
});

/**
 * Open the modal, sending a message to the follower to start sending screen captures.
 */
function initiateMonitoring() {
  showMonitorModal.value = true
  dashboardPinia.requestIndividualAction(props.follower.getUniqueId(), { type: REQUESTS.MONITORSTARTED });
}

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
 * Stop any active monitoring session if the teacher clicks the close or cancel button, resetting a follower's
 * monitoring field.
 */
function cancelMonitor() {
  props.follower.monitoring = false;
  props.follower.permission = null;
  dashboardPinia.requestIndividualAction(props.follower.getUniqueId(), { type: REQUESTS.MONITORENDED });
}

/**
 * Stop any current session and close the modal
 */
function closeModal() {
  cancelMonitor();
  showMonitorModal.value = false
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button class="w-full p-1">
    <div class="w-full h-full rounded-sm flex justify-center items-center hover:bg-white-menu-overlay"
         v-on:click="initiateMonitoring()">
      <img class="w-9 h-5" src="@/assets/img/student-icon-eye.svg" alt="Icon"/>
    </div>
  </button>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showMonitorModal" @close="closeModal">
      <template v-slot:header>
        <header class="h-20 px-8 bg-white flex justify-between items-center rounded-t-lg">
          <div class="bg-white flex flex-col">
            <span class="text-lg font-semibold text-black">Screen Monitoring</span>
            <p class="mt-1 text-sm text-zinc-700">{{ follower.name }}</p>
          </div>

          <img
              v-on:click="closeModal();"
              class="w-4 h-4 cursor-pointer"
              src="@/assets/img/onboarding/close.svg"
              alt="Close Icon"
          />
        </header>
      </template>

      <template v-slot:content>
        <div class="w-auto inline-block max-h-monitor-modal mt-7 mx-9">
          <!--Screenshot content-->
          <div v-if="!follower.monitoring" class="w-modal-width-xsm">
            <div v-if="follower.imageBase64 === undefined" class="flex flex-col items-center">
              <p class="mt-20 lds-dual-ring-lg" />
              <p class="mb-6 mt-8 text-sm ">Collecting current screenshot...</p>
            </div>

            <img v-else class="aspect-video" :id="`image_${follower.getUniqueId()}`" :src="follower.imageBase64 ?? undefined" alt="Follower Screen shot"/>
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
                <p class="mb-6 mt-8 text-sm">Waiting for student permission...</p>
              </div>

              <div v-if="follower.permission === 'connecting'" class="flex flex-col items-center">
                <p class="mt-20 lds-dual-ring-lg" />
                <p class="mb-6 mt-8 text-sm">Connecting to student...</p>
              </div>

              <div v-if="follower.permission === 'declined'" class="flex flex-col items-center">
                <img class="mt-20 w-32 xs:w-48" src="@/assets/img/shocked_col.png" alt="Computer Icon"/>
                <p class="mb-6 mt-8 text-sm font-semibold">Student has declined the permission...</p>
              </div>

              <button class="mb-28 w-36 h-11 flex-shrink-0 font-semibold text-sm text-white bg-blue-500 text-base rounded-3xl hover:bg-blue-400"
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
          >{{follower.monitoring ? 'Stop screen share' : 'Request live screen share'}}</button>

          <div v-show="follower.permission !== 'granted'" class="has-tooltip">
            <Tooltip
                :tip="'Student permission is required for real time screen monitoring'"
                :toolTipMargin="'ml-2'" :arrowMargin="'ml-3.5'"
            />

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