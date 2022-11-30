<script setup lang="ts">
import { useDashboardStore } from "../../stores/dashboardStore";
let dashboardPinia = useDashboardStore();
</script>

<template>
  <div class="flex justify-end items-center bg-white h-16">
    <div class="flex items-center">
      <p class="text-base font-poppins font-semibold mr-3">{{ dashboardPinia.leaderName }}</p>
      <img class="w-3 h-3 mr-8" src="@/assets/img/menu-arrow.svg" alt="Icon"/>
    </div>
  </div>
</template>
