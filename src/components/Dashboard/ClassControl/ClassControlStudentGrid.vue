<script setup lang="ts">
import StudentPlaceholder from "./GridItem/StudentPlaceholder.vue";
import StudentGridItem from "./GridItem/StudentGridItem.vue";
import { Follower } from "../../../models";
import { computed } from "vue";
import { useDashboardStore } from "../../../stores/dashboardStore";
const dashboardPinia = useDashboardStore();

const sortedFollowers = computed((): Array<Follower> => {
  return dashboardPinia.followers.sort((a: Follower, b: Follower) => {
    return a.name.localeCompare(b.name)
  });
});

/** Only count followers that are connected within the active students number. */
const activeFollowers = computed((): number => {
  const active = dashboardPinia.followers.filter(follower => {
    return !follower.disconnected
  })

  return active.length;
});
</script>

<template>
  <div class="mt-14 ml-10">
    <p class="text-base text-black">
      Active Students
      <span v-if="activeFollowers !== 0">
        ({{ activeFollowers }})
      </span>
    </p>

    <div id="studentGrid" class="flex flex-row flex-wrap">
      <!--Student Grid Item (No active students)-->
      <StudentPlaceholder class="mr-4 mt-4" v-if="dashboardPinia.followers.length === 0" />

      <!--Student Grid Item (Active student)-->
      <StudentGridItem
          class="mr-4 mt-4"
          v-for="follower in sortedFollowers"
          :key="follower.getUniqueId()"
          :follower="follower"/>
    </div>
  </div>
</template>
