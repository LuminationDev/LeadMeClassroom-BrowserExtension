<script setup lang="ts">
import StudentPlaceholder from "@/components/Dashboard/ClassControl/GridItem/StudentPlaceholder.vue";
import StudentGridItem from "@/components/Dashboard/ClassControl/GridItem/StudentGridItem.vue";

import { useDashboardStore } from "../../../stores/dashboardStore";
import Follower from "../../../models/_follower";
let dashboardPinia = useDashboardStore();

function removeFollower(follower: Follower) {
  dashboardPinia.removeFollower(follower.getUniqueId())
}

function deleteFollowerTab(follower: Follower, tabId: string) {
  dashboardPinia.requestDeleteFollowerTab(follower.getUniqueId(), tabId)
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
          @delete-tab="(tabId) => { deleteFollowerTab(follower, tabId) }"
          @remove-follower="removeFollower"/>
    </div>
  </div>
</template>
