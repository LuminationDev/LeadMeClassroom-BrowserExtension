<script setup lang="ts">
import { useDashboardStore } from "../../stores/dashboardStore";
let dashboardPinia = useDashboardStore();
</script>

<template>
  <div class="flex justify-end items-center bg-white h-16">
    <div class="flex items-center">
      <p class="text-base font-poppins font-semibold mr-12">{{ dashboardPinia.leaderName }}</p>
    </div>
  </div>
</template>
