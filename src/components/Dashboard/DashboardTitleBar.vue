<script setup>
import { useDashboardStore } from "@/stores/dashboardStore.ts";
let dashboardPinia = useDashboardStore();
</script>

<template>
  <div class="flex justify-end items-center bg-white h-16">
    <div class="flex items-center">
      <p class="text-base font-poppins mr-3">{{ dashboardPinia.leaderName }}</p>
      <img class="w-11 h-11 mr-1.5" src="@/assets/img/profile-placeholder.svg" alt="Icon"/>
      <img class="w-3 h-3 mr-8" src="@/assets/img/menu-arrow.svg" alt="Icon"/>
    </div>
  </div>
</template>
