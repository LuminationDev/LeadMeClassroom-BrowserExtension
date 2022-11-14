<script setup>
import ShareWebsiteModal from "@/components/Modals/ShareWebsiteModal.vue";
import * as REQUESTS from "../../../constants/_requests";
import {ref} from "vue";

import { useDashboardStore } from "../../../stores/dashboardStore.ts";
let dashboardPinia = useDashboardStore();

let locked = ref(false);

function screenControl(action) {
  dashboardPinia.requestAction({ type: REQUESTS.SCREENCONTROL, action: action });
}
</script>

<template>
  <div class="mt-14 ml-10">
    <p class="text-3xl font-bold">{{ dashboardPinia.leaderName }}'s Class</p>

    <!--Action Area-->
    <div class="mt-8 flex child:mr-4">
      <ShareWebsiteModal />

      <button :class="{
          'w-56 h-9 flex justify-center items-center text-white': true,
          'bg-navy-side-menu hover:bg-navy-hover-session-button': locked,
          'bg-blue-session-button hover:bg-blue-hover-session-button': !locked
          }"
           v-on:click="locked = !locked; screenControl(locked ? REQUESTS.BLOCK : REQUESTS.UNBLOCK);"
      >
        <img v-if="locked" class="w-4 h-4" src="@/assets/img/session-icon-unlock.svg" alt="Icon"/>
        <img v-else class="w-4 h-4" src="@/assets/img/session-icon-lock.svg" alt="Icon"/>
        <p class="w-36 text-base">
          {{locked ? 'Unlock screens' : 'Lock screens'}}
        </p>
      </button>
    </div>
  </div>
</template>
