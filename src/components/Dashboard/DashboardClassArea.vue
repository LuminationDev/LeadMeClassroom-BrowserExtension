<script setup>
import {ref} from "vue";
import ShareWebsiteModal from "@/components/Modals/ShareWebsiteModal.vue";

import { useDashboardStore } from "@/stores/dashboardStore.ts";
let dashboardPinia = useDashboardStore();

const locked = ref(false);
</script>

<template>
  <div class="mt-14 ml-10">
    <p class="text-3xl font-bold">{{ dashboardPinia.leaderName }}'s Class</p>

    <!--Action Area-->
    <div class="mt-8 flex child:mr-4">
      <ShareWebsiteModal />

      <button :class="{
          'w-56 h-9 flex justify-center items-center': true,
          'bg-navy-side-menu text-white': locked,
          'bg-gray-default text-gray-default-text': !locked
          }"
           v-on:click="locked = !locked"
      >
        <img class="w-4 h-4 mr-3" src="@/assets/img/menu-placeholder.svg" alt="Icon"/>
        <p class="text-base">
          {{locked ? 'Unlock screens' : 'Lock screens'}}
        </p>
      </button>
    </div>
  </div>
</template>
