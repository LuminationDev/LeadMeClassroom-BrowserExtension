<script setup lang="ts">
import Modal from "./Modal.vue";
import {computed, defineProps, PropType, ref} from "vue";
import Follower from "../../models/_follower";
import HoverButton from "../Buttons/HoverButton.vue";

import { useDashboardStore } from "../../stores/dashboardStore";
let dashboardPinia = useDashboardStore();

defineEmits<{
  (e: 'screenMonitor'): void
}>()

const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  },
});

const showDetailModal = ref(false);

//Track the currently selected tab
const selectedTabId = ref("0");
const selectedTab = computed(() => {
  let tab = props.follower.tabs.find(res => res.id === selectedTabId.value);

  if(tab === undefined) {
    selectedTabId.value = props.follower.tabs[0].id;
    return props.follower.tabs[0];
  } else {
    return tab;
  }
})

function deleteFollowerTab(tabId: string) {
  dashboardPinia.requestDeleteFollowerTab(props.follower.getUniqueId(), tabId)
}

function muteOrUnmuteTab(tabId: string, action: boolean) {
  console.log('heard a mute request', action)
  dashboardPinia.requestUpdateMutingTab(props.follower.getUniqueId(), tabId, action)
}

function changeActiveTab(tab: object) {
  dashboardPinia.requestActiveTab(props.follower.getUniqueId(), tab)
}

function closeModal() {
  showDetailModal.value = false;
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button class="w-full p-1">
    <div class="w-full h-full rounded-sm flex justify-center items-center hover:bg-white-menu-overlay"
         v-on:click="showDetailModal = true; selectedTabId = props.follower.tabs[0].id">
      <img class="w-5 h-3" src="@/assets/img/student-icon-ham-menu.svg" alt="Icon"/>
    </div>
  </button>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showDetailModal" @close="closeModal">
      <template v-slot:header>
        <header class="h-20 px-8 w-modal-width-sm bg-white flex justify-between items-center rounded-t-lg">
          <div class="bg-white flex flex-col">
            <span class="text-lg font-bold text-black">Tab Control</span>
            <p class="mt-1 text-sm text-zinc-700">{{ follower.name }}</p>
          </div>
        </header>
      </template>

      <template v-slot:content>

        <!--Tab control bar-->
        <div class="inline-block h-14 mt-3.5 mb-5 mx-5 flex flex-row justify-center items-center bg-white rounded-3xl shadow-md">
          <div class="flex flex-row h-5">

            <!--Audio control-->
            <div v-if="selectedTab.muting" class="lds-dual-ring h-5 w-7 mr-2" />
            <HoverButton class="h-5 w-7" v-else-if="selectedTab.audible" @click="muteOrUnmuteTab(selectedTab.id, !selectedTab.muted)">
              <template v-slot:original>
                <img v-if="selectedTab.muted" src="@/assets/img/studentDetails/student-icon-muted.svg" alt=""/>
                <img v-else class="h-5 w-5" src="@/assets/img/studentDetails/student-icon-audible.svg"  alt=""/>
              </template>
              <template v-slot:hover>
                <img v-if="selectedTab.muted" src="@/assets/img/studentDetails/student-icon-muted-hover.svg" alt=""/>
                <img v-else class="h-5 w-5" src="@/assets/img/studentDetails/student-icon-audible-hover.svg"  alt=""/>
              </template>
            </HoverButton>
            <img v-else class="h-5 w-5 mr-2" src="@/assets/img/studentDetails/student-icon-audible-disabled.svg" alt=""/>

            <!--Tab focus control-->
            <HoverButton  v-if="selectedTab.id !== follower.tabs[0].id" class="mx-14 h-5 w-5" @click="changeActiveTab(selectedTab)">
              <template v-slot:original><img src="@/assets/img/studentDetails/student-icon-focus.svg"  alt="focus"/></template>
              <template v-slot:hover><img src="@/assets/img/studentDetails/student-icon-focus-hover.svg"  alt="focus"/></template>
            </HoverButton>
            <img v-else class="mx-14 h-5" src="@/assets/img/studentDetails/student-icon-focus-disabled.svg"  alt="focus"/>

            <!--Close tab-->
            <div v-if="selectedTab.closing" class="lds-dual-ring h-5" />
            <HoverButton v-else @click="deleteFollowerTab(selectedTab.id)" class="h-5 w-5">
              <template v-slot:original><img class="h-4" src="@/assets/img/studentDetails/student-icon-close-tab.svg"  alt="close"/></template>
              <template v-slot:hover><img class="h-4" src="@/assets/img/studentDetails/student-icon-close-tab-hover.svg"  alt="close"/></template>
            </HoverButton>
          </div>
        </div>

        <!--Tab list-->
        <div class="w-modal-width-sm h-96 flex flex-col overflow-y-auto">
          <div v-for="(tab, index) in follower.tabs" class="py-1" :id="tab.id">

            <!--Individual tabs-->
            <div class="flex flex-row w-full px-5 items-center justify-between">
              <div :class="{
                  'w-full h-9 px-5 flex flex-row items-center overflow-ellipsis whitespace-nowrap': true,
                  'overflow-hidden rounded-lg cursor-pointer': true,
                  'hover:bg-opacity-50 hover:bg-gray-300': selectedTab.id !== tab.id,
                  'bg-white': selectedTab.id === tab.id,
                  }"
                  @click="selectedTabId = tab.id"
              >
                <img class="flex-shrink-0 w-5 h-5 mr-2 cursor-pointer" :src="tab.favicon" alt=""/>
                <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5">{{ tab.getTabUrlWithoutHttp() }}</span>

                <!--Audible icons-->
                <div class="flex flex-shrink-0 flex-[1_1_auto] justify-end">
                  <div class="h-4 mr-4 flex flex-row justify-center">
                    <Transition
                        enter-from-class="opacity-0 scale-110"
                        enter-to-class="opacity-100 scale-100"
                        enter-active-class="transition duration-300"
                        leave-active-class="transition duration-200"
                        leave-from-class="opacity-100 scale-100"
                        leave-to-class="opacity-0 scale-110"
                    >
                      <div v-if="tab.audible">
                        <div v-if="tab.muting" class="lds-dual-ring" />
                        <img v-else-if="tab.muted" src="@/assets/img/studentDetails/student-icon-sound-disabled.svg"  alt=""/>
                        <img v-else src="@/assets/img/studentDetails/student-icon-sound.svg"  alt=""/>
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </template>

      <template v-slot:footer>
        <footer class="w-modal-width-sm">
          <div class="h-12 bg-navy-side-menu rounded-b-sm flex">
            <button class="w-full p-1 flex justify-center">
              <div class="w-1/2 h-full rounded-sm flex justify-center items-center hover:bg-white-menu-overlay"
                   v-on:click="$emit('screenMonitor'); showDetailModal = false">
                <img class="w-9 h-5" src="@/assets/img/student-icon-eye.svg" alt="Icon"/>
              </div>
            </button>

            <div class="h-10 mt-1 w-px bg-white"></div>

            <button class="w-full py-1 flex justify-center">
              <div class="w-1/2 h-full rounded-sm flex justify-center items-center hover:bg-white-menu-overlay"
                   v-on:click="showDetailModal = false">
                <img class="w-5 h-3" src="@/assets/img/minimize.svg" alt="Icon"/>
              </div>
            </button>
          </div>
        </footer>
      </template>
    </Modal>
  </Teleport>
</template>

<style>
.lds-dual-ring {
  display: inline-block;
  width: 20px;
  height: 20px;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #182B50;
  border-color: #182B50 transparent #182B50 transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
