<script setup lang="ts">
import {computed, defineProps, PropType, ref} from "vue";
import {Follower, Tab} from "../../../../models";
import { useDashboardStore } from "../../../../stores/dashboardStore";
const dashboardPinia = useDashboardStore();

const emit = defineEmits<{
  (e: 'update:renaming', value: boolean): void
  (e: 'update:name', value: string): void
  (e: 'update:screenType', value: string): void
}>()

const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  },
  controls: {
    type: Boolean,
    required: false,
    default: true
  },
  renaming: {
    type: Boolean,
    required: false,
    default: false
  },
  name: {
    type: String,
    required: false
  },
  screenType: {
    type: String,
    required: false,
    default: 'tabs'
  }
});

/**
 * Compute the first three tabs of a follower, ordering by the lastActivated field. Check if the active tab is within
 * the current tasks.
 */
const firstThreeTabs = computed((): Array<Tab> => {
  if(!props.follower.tabs) {
    return [];
  }

  if(props.follower.tabs.length === 0) {
    return [];
  }

  let temp = props.follower.tabs.sort((a: Tab, b: Tab) => { return b.lastActivated! - a.lastActivated! }).slice(0, 3);
  checkActiveTask(temp[0].url);
  return temp;
})

/**
 * Check if the lastActivated website is within the tasks array. The task array is populated when a teacher pushes
 * out a website.
 * @param website A string representing the URL of the currently active website for a follower.
 */
const checkActiveTask = async (website: string) => {
  let tasks = dashboardPinia.tasks;
  if(tasks.length === 0) { return; }

  let strict = true; //determine if website needs to be exact or just same hostname

  const { hostname } = new URL(website); //Extract the hostname for non-strict monitoring
  props.follower.offTask = !tasks.some((res) => (strict ? website.includes(res.toString()) : res.includes(hostname)));
}

/**
 * Wait a for the field to be shown and then focus it.
 */
const inputField = ref()
const focusInput = () => {
  setTimeout(() => {inputField.value.focus()}, 100);
};

const revertInput = () => {
  setTimeout(() => {emit('update:renaming', false)}, 200);
}
</script>

<template>
  <!--Disconnected screen-->
  <div v-if="follower.disconnected" class="text-lg text-center h-full flex flex-col justify-center">
    <span><span class="font-semibold">{{ follower.name }}</span><br/> has left the lesson.</span>
  </div>

  <!--Options screen-->
  <div v-else-if="screenType === 'options'" class="h-full text-sm text-white flex flex-col justify-center bg-navy-side-menu border-b border-t-modal-site-background">
    <div class="h-6 cursor-pointer flex flex-row mx-2 px-2 items-center hover:bg-white-menu-overlay rounded">
      <img class="flex-shrink-0 w-3 h-3 mr-2" src="@/assets/img/options-edit.svg"  alt=""/>
      <span v-if="!renaming" v-on:click="$emit('update:renaming', true); focusInput()">Rename User</span>
      <input v-else ref="inputField" @input="$emit('update:name', $event.target.value)" @focusout="revertInput" class="bg-navy-side-menu w-full pl-1"/>
    </div>

    <div class="h-6 mt-1.5 cursor-pointer flex flex-row mx-2 px-2 items-center hover:bg-white-menu-overlay rounded"
         v-on:click="$emit('update:screenType', 'remove')">
      <img class="flex-shrink-0 w-3 h-3 mr-2" src="@/assets/img/options-remove.svg"  alt=""/>
      <span class="">Remove {{follower.name}}</span>
    </div>
  </div>

  <!--Remove screen-->
  <div v-else-if="screenType === 'remove'" class="text-base text-center h-full flex flex-col justify-center">
    <span>Remove from session?</span>
  </div>

  <!--Tab screen-->
  <div v-else-if="screenType === 'tabs'">
    <!--The assistant page is present but not counted-->
    <div v-if="firstThreeTabs.length === 0" class="py-1">
      <div class="flex flex-row px-2 items-center">
        <img class="flex-shrink-0 w-4 h-4 mr-2" src="@/assets/img/icon-128.png"  alt=""/>
        <span class="overflow-ellipsis whitespace-nowrap overflow-hidden">No open tabs...</span>
      </div>
    </div>

    <transition-group v-else name="list" tag="div">
      <div v-for="(tab, index) in firstThreeTabs" v-bind:key="tab" class="py-1 w-48" :id="index">
        <div class="flex flex-row px-2 items-center">
          <img class="flex-shrink-0 w-4 h-4 mr-2" :src="tab.getFavicon()"  alt=""/>
          <span class="overflow-ellipsis whitespace-nowrap overflow-hidden">{{ tab.getTabUrlWithoutHttp() }}</span>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style>
/* apply transition to moving elements */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
