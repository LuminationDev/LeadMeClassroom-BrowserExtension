<script setup lang="ts">
import { usePopupStore } from "../../../stores/popupStore";
import { useDashboardStore } from "../../../stores/dashboardStore";
const popupPinia = usePopupStore();
const dashboardPinia = useDashboardStore();

function SendDashboardMessage(message: string) {
  chrome.tabs.query({ pinned: true }, ([tab]) => {
    if (!tab) { return; }

    if (tab.id != null && tab.url == null) {
        chrome.tabs.sendMessage(tab.id, message);
    }
  });
}
</script>

<template>
  <div class="mt-9">
    <div class="h-56 text-left">
      <p class="text-sm py-4 cursor-pointer"
         v-on:click="popupPinia.viewOrOpenDashboard(); SendDashboardMessage('GoToDashboard')"
      >Dashboard</p>
      <hr class="border border-white">
    </div>
  </div>
</template>
