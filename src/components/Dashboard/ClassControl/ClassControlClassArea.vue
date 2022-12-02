<script setup lang="ts">
import ShareWebsiteModal from "../../../components/Modals/ShareWebsiteModal.vue";
import * as REQUESTS from "../../../constants/_requests";
import { ref } from "vue";

import { useDashboardStore } from "../../../stores/dashboardStore";
let dashboardPinia = useDashboardStore();

let locked = ref(false);

function screenControl(action: object) {
  dashboardPinia.requestAction({ type: REQUESTS.SCREENCONTROL, action: action });
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
           v-on:click="locked = !locked; screenControl(locked ? REQUESTS.BLOCK : REQUESTS.UNBLOCK);"
      >
        <img v-if="locked" class="w-4 h-4 mr-3" src="@/assets/img/session-icon-unlock.svg" alt="Icon"/>
        <img v-else class="w-4 h-4 mr-3" src="@/assets/img/session-icon-lock.svg" alt="Icon"/>
        <p class="text-base">
          {{locked ? 'Unlock screens' : 'Lock screens'}}
        </p>
      </button>
    </div>
  </div>
</template>
