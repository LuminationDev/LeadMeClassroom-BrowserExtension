<script setup lang="ts">
import {defineProps, PropType, computed, ref} from 'vue'
// @ts-ignore
import * as MODELS from '@/models/index.ts';
import { Tab, Follower } from "../../../../models";
import StudentDetailModal from "@/components/Modals/StudentDetailModal.vue";
import ScreenMonitorModal from "@/components/Modals/ScreenMonitorModal.vue";
import { useDashboardStore } from "../../../../stores/dashboardStore";
let dashboardPinia = useDashboardStore();

const emit = defineEmits<{
  (e: 'removeFollower', follower: Follower): void
  (e: 'update', value: boolean): void
}>()

const removing = ref(false)

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

/**
 * Compute the first three tabs of a follower, ordering by the lastActivated field. Check if the active tab is within
 * the current tasks.
 */
const firstThreeTabs = computed(() => {
  if(!props.follower.tabs) {
    return [];
  }

  let temp = props.follower.tabs.sort((a: Tab, b: Tab) => { return b.lastActivated - a.lastActivated }).slice(0, 3);
  checkActiveTask(temp[0].url);
  return temp;
})

/**
 * Check if the lastActivated website is within the tasks array. The task array is populated when a teacher pushes
 * out a website.
 * @param website A string representing the URL of the currently active website for a follower.
 */
async function checkActiveTask(website: string) {
  let tasks = dashboardPinia.tasks;
  if(tasks.length === 0) { return; }

  let strict = true; //determine if website needs to be exact or just same hostname

  const { hostname } = new URL(website); //Extract the hostname for non-strict monitoring
  props.follower.offTask = !tasks.some((res) => (strict ? website.includes(res.toString()) : res.includes(hostname)));
}

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

      <!--Student title bar-->
      <div :class="{
        'h-9 bg-white flex items-center': true,
        'justify-between': controls
      }">

        <input
            v-if="!controls"
            name="test"
            type="checkbox"
            class="h-5 w-5 mx-2"
            :disabled="follower.disconnected"
            @input="$emit('update', $event.target.checked)"
        >

        <label for="test" class="text-sm" :class="{
          'mr-3 text-sm overflow-hidden whitespace-nowrap text-ellipsis': true,
          'ml-2.5': controls,
          'text-gray-400': follower.disconnected,
          'text-black': !follower.disconnected
        }">{{ follower.name }}</label>

        <img
            v-if="controls && !follower.offTask"
            class="w-4 h-4 mr-2 cursor-pointer"
            src="@/assets/img/student-icon-menu.svg"
            alt="menu icon"
        />

        <img
            v-if="controls && follower.offTask"
            class="w-6 h-6 mr-2 cursor-pointer"
            src="@/assets/img/student-icon-alert.svg"
            alt="alert icon"
        />
      </div>

      <!--Disconnected screen-->
      <div v-if="follower.disconnected" class="text-lg text-center h-full flex flex-col justify-center">
        <span><b>{{ follower.name }}</b><br/> has left the lesson.</span>
      </div>

      <!--Tab content-->
      <div v-else>
        <div v-for="(tab, index) in firstThreeTabs" class="py-1" :id="index">
          <div class="flex flex-row px-2 items-center">
            <img class="flex-shrink-0 w-4 h-4 mr-2" :src="tab.favicon"  alt=""/>
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
</template>
