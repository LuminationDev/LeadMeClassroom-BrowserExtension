<script setup lang="ts">
import Modal from "./Modal.vue";
import {defineProps, PropType, ref} from "vue";
import Follower from "../../models/_follower";
import { useDashboardStore } from "../../stores/dashboardStore";
let dashboardPinia = useDashboardStore();

const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  },
});

const showDetailModal = ref(false);

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

</script>

<template>
  <!--Anchor button used to control the modal-->
  <button class="w-full flex justify-center items-center"
    v-on:click="showDetailModal = true"
  >
    <img class="w-5 h-3" src="@/assets/img/student-icon-ham-menu.svg" alt="Icon"/>
  </button>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showDetailModal" :rounded="false">
      <template v-slot:header>
        <header class="h-20 px-8 w-modal-width-sm bg-white flex justify-between items-center rounded-t-lg">
          <div class="h-9 bg-white flex items-center">
            <span class="text-lg text-black">{{ follower.name }}</span>
          </div>
        </header>
      </template>

      <template v-slot:content>
        <div class="w-modal-width-sm h-96 pt-5 flex flex-col overflow-y-scroll">
          <div v-for="(tab, index) in follower.tabs" class="py-3" :id="tab.id">
            <div class="flex flex-row w-full px-5 items-center justify-between">
              <div class="flex-[7_7_0%] flex flex-row overflow-ellipsis whitespace-nowrap overflow-hidden">
                <img class="flex-shrink-0 w-5 h-5 mr-2 cursor-pointer"
                  :src="tab.favicon"
                  @click="changeActiveTab(tab)"
                />
                <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5">{{ tab.url }}</span>
              </div>
              <div class="flex flex-shrink-0 flex-[1_1_auto] justify-end">
                <div class="h-4 mr-4 flex flex-row justify-center">
                  <div v-if="tab.muting" class="lds-dual-ring" />
                  <button v-else-if="tab.audible" @click="muteOrUnmuteTab(tab.id, !tab.muted)">
                    <img v-if="tab.muted" src="@/assets/img/volume_off.svg" />
                    <img v-else src="@/assets/img/volume_on.svg" />
                  </button>
                </div>
                <button v-if="!tab.closing" @click="deleteFollowerTab(tab.id)">
                  <img class="h-4" src="@/assets/img/cross.svg" />
                </button>
                <div class="lds-dual-ring h-4" v-else />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <footer class="w-modal-width-sm">
          <div class="h-12 bg-navy-side-menu rounded-b-sm flex">
            <button class="w-full flex justify-center items-center">
              <img class="w-9 h-5" src="@/assets/img/student-icon-eye.svg" alt="Icon"/>
            </button>
            <div class="h-10 mt-1 w-px bg-white"></div>
            <button class="w-full flex justify-center items-center"
                v-on:click="showDetailModal = false"
            >
              <img class="w-5 h-3" src="@/assets/img/minimize.svg" alt="Icon"/>
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
  width: 10px;
  height: 10px;
  margin-right: 5px;
  margin-bottom: 5px;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 16px;
  height: 16px;
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
