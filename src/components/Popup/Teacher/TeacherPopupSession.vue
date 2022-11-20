<script setup lang="ts">
import { usePopupStore } from "../../../stores/popupStore";
import { useDashboardStore } from "../../../stores/dashboardStore";
let popupPinia = usePopupStore();
let dashboardPinia = useDashboardStore();
</script>

<template>
  <div class="mt-9">
    <div class="h-56 text-left">
      <p class="text-sm py-4 cursor-pointer" v-on:click="popupPinia.viewOrOpenDashboard()">Dashboard</p>
      <hr class="border border-white">
    </div>
  </div>
</template>
