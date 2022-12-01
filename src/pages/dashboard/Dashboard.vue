<script setup lang="ts">
import '@/styles.css'
import TheDashboard from "../../components/Dashboard/TheDashboard.vue";
import { useDashboardStore } from "../../stores/dashboardStore";
const dashboardPinia = useDashboardStore();

/**
 * Establish a listener to respond to events emitted by the popup extension.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      console.log(request);

      switch(request) {
        case "GoToDashboard":
          dashboardPinia.changeView("dashboard");
          break;

        case "EndSession":
          dashboardPinia.endSession();
          break;
      }
    }
);
</script>

<template>
  <TheDashboard />
</template>
