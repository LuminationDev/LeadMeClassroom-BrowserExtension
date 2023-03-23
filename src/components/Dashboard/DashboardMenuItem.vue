<script setup lang="ts">
import { useDashboardStore } from "../../stores/dashboardStore";
const dashboardPinia = useDashboardStore();

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
  <router-link
      :class="{
        'w-44 h-9 ml-6 pl-3 flex items-center cursor-pointer rounded-lg font-light': true,
        'bg-white-menu-overlay': dashboardPinia.view === view,
        'hover:bg-white-menu-overlay': dashboardPinia.view !== view,
      }"
    :to="view">
    <img class="w-5 h-5 mr-3" :src="icon" alt="Icon"/>
    <p class="text-base text-white">
      <slot></slot>
    </p>
  </router-link>
</template>
