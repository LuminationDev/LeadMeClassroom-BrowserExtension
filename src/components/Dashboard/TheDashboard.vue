<script setup>
import DashboardSideMenu from "@/components/Dashboard/DashboardSideMenu.vue";
import DashboardMain from "@/components/Dashboard/DashboardMain.vue";
import DashboardTitleBar from "@/components/Dashboard/DashboardTitleBar.vue";
</script>

<template>
  <div class="flex">
    <!--SideMenu-->
    <DashboardSideMenu class="font-poppins" />

    <div class="flex flex-grow flex-col h-screen">
      <!--TitleBar-->
      <DashboardTitleBar />

      <!--MainArea-->
      <DashboardMain />
    </div>
  </div>
</template>
