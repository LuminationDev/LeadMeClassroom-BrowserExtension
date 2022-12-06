<script setup lang="ts">
import ShareWebsiteModal from "../../../components/Modals/ShareWebsiteModal.vue";
import * as REQUESTS from "../../../constants/_requests";
import { ref } from "vue";

import { useDashboardStore } from "../../../stores/dashboardStore";
const dashboardPinia = useDashboardStore();

const loading = ref(false);
const locked = ref(false);

async function screenControl() {
  loading.value = true;
  await new Promise(res => setTimeout(res, 500));
  locked.value = !locked.value;
  loading.value = false;
  dashboardPinia.requestAction({ type: REQUESTS.SCREENCONTROL, action: locked.value ? REQUESTS.BLOCK : REQUESTS.UNBLOCK });
}
</script>

<template>
  <div class="mt-14 ml-10">
    <p class="text-3xl font-medium">{{ dashboardPinia.leaderName }}'{{ dashboardPinia?.leaderName?.endsWith('s') ? '' : 's' }} Class</p>

    <!--Action Area-->
    <div class="mt-8 flex child:mr-4">
      <ShareWebsiteModal />

      <button :class="{
          'w-56 h-9 flex justify-center font-medium items-center text-white': true,
          'bg-navy-side-menu hover:bg-navy-hover-session-button': locked,
          'bg-blue-500 hover:bg-blue-400': !locked
          }"
          :disabled="loading"
          v-on:click="screenControl();"
      >
        <span v-if="loading" class="lds-dual-ring-screen h-4 w-4 mr-3"></span>

        <span v-else class="flex flex-row place-items-center">
          <img v-if="locked" class="w-4 h-4 mr-3" src="@/assets/img/session-icon-unlock.svg" alt="Icon"/>
          <img v-else class="w-4 h-4 mr-3" src="@/assets/img/session-icon-lock.svg" alt="Icon"/>
          <span class="text-base">
            {{locked ? 'Unlock screens' : 'Lock screens'}}
          </span>
        </span>
      </button>
    </div>
  </div>
</template>

<style>
.lds-dual-ring-screen {
  display: inline-block;
  width: 20px;
  height: 20px;
}
.lds-dual-ring-screen:after {
  content: " ";
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  border-color: #ffffff transparent #ffffff transparent;
  animation: lds-dual-ring-screen 1.2s linear infinite;
}
@keyframes lds-dual-ring-screen {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>