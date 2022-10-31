<script setup>
import ClassControlStudentPlaceholder from "@/components/Dashboard/ClassControl/ClassControlStudentPlaceholder.vue";
import ClassControlStudentGridItem from "@/components/Dashboard/ClassControl/ClassControlStudentGridItem.vue";

import { useDashboardStore } from "@/stores/dashboardStore.ts";
let dashboardPinia = useDashboardStore();
</script>

<template>
  <div class="mt-14 ml-10">
    <p class="text-base text-black">Active Students</p>

    <div id="studentGrid" class="mt-4 grid grid-cols-2">
      <!--Student Grid Item (No active students)-->
      <ClassControlStudentPlaceholder v-if="dashboardPinia.followers.length === 0" />

      <!--Student Grid Item (Active student)-->
      <ClassControlStudentGridItem v-for="follower in dashboardPinia.followers" :key="follower.getUniqueId()" :follower="follower" />
    </div>
  </div>
</template>
