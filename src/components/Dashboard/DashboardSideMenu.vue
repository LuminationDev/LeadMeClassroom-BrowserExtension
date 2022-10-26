<script setup>
import DashboardMenuItem from "@/components/Dashboard/DashboardMenuItem.vue";
import DashboardContentItems from "@/components/Dashboard/DashboardContentItems.vue";
</script>

<template>
  <div class="w-56 h-screen bg-navy-side-menu">
    <div>
      <img class="w-28 h-14 ml-6 pt-6 mb-4" src="@/assets/img/icon-dashboard-logo.svg" alt="LeadMe Icon"/>

      <hr class="mx-5 border border-gray-menu-separator">
    </div>

    <!--Content options-->
    <DashboardContentItems />

    <!--Logout-->
    <DashboardMenuItem class="fixed bottom-12">Log Out</DashboardMenuItem>
  </div>
</template>
