<script setup lang="ts">
import StudentPlaceholder from "./GridItem/StudentPlaceholder.vue";
import StudentGridItem from "./GridItem/StudentGridItem.vue";
import {computed} from "vue";
import {useDashboardStore} from "../../../stores/dashboardStore";
import {Follower} from "../../../models";

const dashboardPinia = useDashboardStore();

const sortedFollowers = computed((): Array<Follower> => {
  return dashboardPinia.followers.sort((a: Follower, b: Follower) => {
    return a.name.localeCompare(b.name)
  });
})
</script>

<template>
  <div class="mt-14 ml-10">
    <p class="text-base text-black">
      Active Students
      <span v-if="dashboardPinia.followers.length !== 0">
        ({{ dashboardPinia.followers.length }})
      </span>
    </p>

    <div id="studentGrid" class="flex flex-row flex-wrap">
      <!--Student Grid Item (No active students)-->
      <StudentPlaceholder v-if="dashboardPinia.followers.length === 0" />

      <!--Student Grid Item (Active student)-->
      <StudentGridItem
          class="mr-4 mt-4"
          v-for="follower in sortedFollowers"
          :key="follower.getUniqueId()"
          :follower="follower"/>
    </div>
  </div>
</template>
