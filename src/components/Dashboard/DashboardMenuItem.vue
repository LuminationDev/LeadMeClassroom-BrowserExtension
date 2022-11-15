<script setup>
import { useDashboardStore } from "@/stores/dashboardStore.ts";
let dashboardPinia = useDashboardStore();

defineProps({
  view: {
    type: String
  },
  icon: {
    type: String
  }
})
</script>

<template>
  <div
      class="w-44 h-9 ml-6 pl-3 flex items-center
      cursor-pointer hover:bg-white-menu-overlay
      rounded-lg"
      v-on:click="dashboardPinia.changeView(view)"
  >
    <img class="w-5 h-5 mr-3" :src="icon" alt="Icon"/>
    <p class="text-base text-white">
      <slot></slot>
    </p>
  </div>
</template>
