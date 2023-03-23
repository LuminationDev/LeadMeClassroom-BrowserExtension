<script setup lang="ts">
import DashboardMenuItem from "../../components/Dashboard/DashboardMenuItem.vue";
import { useDashboardStore } from "../../stores/dashboardStore";
import { usePopupStore } from "../../stores/popupStore";
const popupPinia = usePopupStore();
const dashboardPinia = useDashboardStore();
</script>

<template>
  <div class="w-56 h-screen bg-navy-side-menu">
    <div>
      <img class="w-28 h-14 ml-6 pt-6 mb-4" src="@/assets/img/icon-dashboard-logo.svg" alt="LeadMe Icon"/>

      <hr class="mx-5 border border-gray-menu-separator">
    </div>

    <!--Content options-->
    <div class="mt-28 child:mb-6">
      <DashboardMenuItem icon="../../assets/img/menu-icon-dashboard.svg" view="/">Dashboard</DashboardMenuItem>
      <DashboardMenuItem icon="../../assets/img/menu-icon-dashboard.svg" view="/bookmarks">Bookmarks</DashboardMenuItem>
      <DashboardMenuItem icon="../../assets/img/menu-icon-dashboard.svg" view="/lessons">Lesson Plans</DashboardMenuItem>
      <DashboardMenuItem icon="../../assets/img/menu-icon-account.svg" view="/account">Account</DashboardMenuItem>
    </div>

    <!--End the active session and logout-->
    <DashboardMenuItem
        icon="../../assets/img/menu-icon-logout.svg" class="fixed bottom-12"
        v-on:click="dashboardPinia.endSession(); popupPinia.handleLogoutClick()"
        view="/"
    >Log Out</DashboardMenuItem>
  </div>
</template>
