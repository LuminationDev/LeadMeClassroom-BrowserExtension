<script setup lang="ts">
import { usePopupStore } from "../../../stores/popupStore";
const popupPinia = usePopupStore();
</script>

<template>
  <div class="mt-9">
    <div class="h-56 text-left">
      <p class="text-sm py-4 cursor-pointer"
         v-on:click="popupPinia.viewOrOpenDashboard(); popupPinia.SendDashboardMessage('GoToDashboard')"
      >Dashboard</p>
      <hr class="border border-white">
    </div>
  </div>
</template>
