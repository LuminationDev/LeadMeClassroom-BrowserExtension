<script setup lang="ts">
import {defineProps, PropType, computed, ref} from 'vue'
import * as REQUESTS from '../../../../constants/_requests'
// @ts-ignore
import * as MODELS from '@/models/index.ts';
import { Tab, Follower } from "../../../../models";
import ClassControlStudentDetailModal from "@/components/Dashboard/ClassControl/ClassControlStudentDetailModal.vue";
import ScreenMonitorModal from "@/components/Modals/ScreenMonitorModal.vue";

import { useDashboardStore } from "../../../../stores/dashboardStore";
let dashboardPinia = useDashboardStore();

const emit = defineEmits<{
  (e: 'removeFollower', follower: Follower): void
  (e: 'deleteTab', tabId: string): void
  (e: 'muteTab', tabId: string, action: boolean): void
  (e: 'update', value: boolean): void
}>()

const removing = ref(false)

const firstThreeTabs = computed(() => {
  return props.follower.tabs ? props.follower.tabs.sort((a: Tab, b: Tab) => { return b.lastActivated - a.lastActivated }).slice(0, 3) : []
})

const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  },
  controls: {
    type: Boolean,
    required: false,
    default: true
  }
});

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

function removeFollower () {
  removing.value = true
  setTimeout(() => {
    emit('removeFollower', props.follower)
  }, 500)
}

function deleteTab (tabId: string) {
  emit('deleteTab', tabId)
}

const showExtendedModal = ref(false);
const showMonitorModal = ref(false);

function muteTab (tabId: string, action: boolean) {
  emit('muteTab', tabId, action)
}

</script>

<template>
  <div class="w-48 transition-all duration-500 ease-in-out" :class="removing ? 'opacity-0' : ''" :id="follower.getUniqueId()">
    <div class="h-28 flex flex-col bg-gray-active-student border-2 border-navy-side-menu rounded-t-sm">
      <div class="h-9 bg-white flex items-center">
        <input name="test" type="checkbox" class="h-5 w-5 mx-2" :disabled="follower.disconnected" @input="$emit('update', $event.target.checked)">
        <label for="test" class="text-sm" :class="follower.disconnected ? 'text-gray-400' : 'text-black'">{{ follower.name }}</label>
      </div>

      <!--Disconnected screen-->
      <div v-if="follower.disconnected" class="text-lg text-center h-full flex flex-col justify-center">
        <span><b>{{ follower.name }}</b><br/> has left the lesson.</span>
      </div>

      <!--Tab content-->
      <div v-else>
        <div v-for="(tab, index) in firstThreeTabs" class="py-1" :id="index">
          <div class="flex flex-row px-2 items-center">
            <img class="flex-shrink-0 w-4 h-4 mr-2" :src="tab.favicon" />
            <span class="overflow-ellipsis whitespace-nowrap overflow-hidden">{{ tab.url }}</span>
          </div>
        </div>
      </div>
    </div>

    <!--Dismiss button-->
    <div v-if="follower.disconnected && controls" class="h-12 bg-navy-side-menu rounded-b-sm flex">
      <button @click="removeFollower" class="w-full flex justify-center items-center">
        <span class="text-sm text-white font-poppins">Dismiss</span>
      </button>
    </div>

    <!--Student buttons-->
    <div v-else-if="controls" class="h-12 bg-navy-side-menu rounded-b-sm flex">
      <ScreenMonitorModal
          :follower="follower"
      />

      <div class="h-10 mt-1 w-px bg-white"></div>

      <ClassControlStudentDetailModal
          :follower="follower"
          :show-modal="showExtendedModal"
          @hide="() => { showExtendedModal = false }"
          @delete-tab="deleteTab"
          @mute-tab="muteTab"/>
      <button class="w-full flex justify-center items-center" @click="() => { showModal = true }">
        <img class="w-5 h-3" src="@/assets/img/student-icon-ham-menu.svg" alt="Icon"/>
      </button>
    </div>
  </div>

<!--  <div class="h-36 w-36" :id="follower.getUniqueId()">-->
<!--    <img v-if="follower.imageBase64" :id="`image_${follower.getUniqueId()}`" :src="follower.imageBase64" alt="Follower Screen shot"/>-->
<!--    <video :id="`video_${follower.getUniqueId()}`" muted autoplay/>-->
<!--    <button @click="() => { handleMonitorFollowerButton() }">{{ follower.monitoring ? 'Stop Monitoring' : 'Request Monitoring' }}</button>-->
<!--    <button @click="() => { handleMuteFollowerButton() }">{{ follower.muted ? 'Unmute Tab' : 'Mute Tab' }}</button>-->
<!--    <button @click="() => { handleMuteAllFollowerButton() }">{{ follower.muteAll ? 'Unmute All Tab' : 'Mute All Tab' }}</button>-->
<!--    <button @click="() => { handleVideoButton(REQUESTS.VIDEOPLAY) }">Play</button>-->
<!--    <button @click="() => { handleVideoButton(REQUESTS.VIDEOPAUSE) }">Pause</button>-->
<!--    <button @click="() => { handleVideoButton(REQUESTS.VIDEOSTOP) }">Stop</button>-->
<!--  </div>-->
</template>
