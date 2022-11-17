<script setup lang="ts">
import StudentPlaceholder from "./GridItem/StudentPlaceholder.vue";
import StudentGridItem from "./GridItem/StudentGridItem.vue";

import { Follower } from "../../../models"
import { useDashboardStore } from "../../../stores/dashboardStore";
let dashboardPinia = useDashboardStore();

function removeFollower(follower: Follower) {
  dashboardPinia.removeFollower(follower.getUniqueId())
}
</script>

<template>
  <div class="mt-14 ml-10">
    <p class="text-base text-black">Active Students</p>

    <div id="studentGrid" class="mt-4 grid grid-cols-2">
      <!--Student Grid Item (No active students)-->
      <StudentPlaceholder v-if="dashboardPinia.followers.length === 0" />

      <!--Student Grid Item (Active student)-->
      <StudentGridItem
          v-for="follower in dashboardPinia.followers"
          :key="follower.getUniqueId()"
          :follower="follower"
          @remove-follower="removeFollower"/>
    </div>
  </div>
</template>
