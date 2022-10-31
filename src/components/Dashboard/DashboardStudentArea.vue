<script setup>
import DashboardStudentPlaceholder from "@/components/Dashboard/DashboardStudentPlaceholder.vue";
import DashboardStudentGridItem from "@/components/Dashboard/DashboardStudentGridItem.vue";

import { useDashboardStore } from "@/stores/dashboardStore.ts";
let dashboardPinia = useDashboardStore();
</script>

<template>
  <div class="mt-14 ml-10">
    <p class="text-base text-black">Active Students</p>

    <div id="studentGrid" class="mt-4 grid grid-cols-2">
      <!--Student Grid Item (No active students)-->
      <DashboardStudentPlaceholder v-if="dashboardPinia.followers" />

      <!--Student Grid Item (Active student)-->
      <DashboardStudentGridItem v-for="follower in dashboardPinia.followers" :key="follower.getUniqueId()" :follower="follower" />
    </div>
  </div>
</template>
