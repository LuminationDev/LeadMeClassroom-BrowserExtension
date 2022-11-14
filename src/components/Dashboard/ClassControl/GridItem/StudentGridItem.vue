<script setup lang="ts">
import {defineProps, PropType, computed, ref} from 'vue'
// @ts-ignore
import * as MODELS from '@/models/index.ts';
import { Tab, Follower } from "../../../../models";
import StudentDetailModal from "@/components/Modals/StudentDetailModal.vue";
import ScreenMonitorModal from "@/components/Modals/ScreenMonitorModal.vue";

const emit = defineEmits<{
  (e: 'removeFollower', follower: Follower): void
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

function removeFollower () {
  removing.value = true
  setTimeout(() => {
    emit('removeFollower', props.follower)
  }, 500)
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
      <!--Screenshot and WebRTC modal-->
      <ScreenMonitorModal :follower="follower" />

      <div class="h-10 mt-1 w-px bg-white"></div>

      <!--Expanded student details modal-->
      <StudentDetailModal :follower="follower" />
    </div>
  </div>

<!--  <div class="h-36 w-36" :id="follower.getUniqueId()">-->
<!--    <button @click="() => { handleVideoButton(REQUESTS.VIDEOPLAY) }">Play</button>-->
<!--    <button @click="() => { handleVideoButton(REQUESTS.VIDEOPAUSE) }">Pause</button>-->
<!--    <button @click="() => { handleVideoButton(REQUESTS.VIDEOSTOP) }">Stop</button>-->
<!--  </div>-->
</template>
