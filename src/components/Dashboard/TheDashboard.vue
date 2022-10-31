<script setup>
import DashboardSideMenu from "@/components/Dashboard/DashboardSideMenu.vue";
import DashboardTitleBar from "@/components/Dashboard/DashboardTitleBar.vue";

//Page layouts
import DashboardMain from "@/components/Dashboard/ClassControl/ClassControlMain.vue";
import AccountMain from "@/components/Dashboard/Account/AccountMain.vue";
import SettingsMain from "@/components/Dashboard/Settings/SettingsMain.vue";
import StudentsMain from "@/components/Dashboard/Students/StudentsMain.vue";
import ContentMain from "@/components/Dashboard/Content/ContentMain.vue";

import { onMounted } from "vue";
import {useDashboardStore} from "@/stores/dashboardStore";
const dashboardPinia = useDashboardStore();

//Check for any active class on load
onMounted(() => dashboardPinia.attachClassListeners(true));
</script>

<template>
  <div class="flex">
    <!--SideMenu-->
    <DashboardSideMenu class="font-poppins" />

    <div class="flex flex-grow flex-col h-screen">
      <!--TitleBar-->
      <DashboardTitleBar />

      <!--MainArea-->
      <div class="flex flex-col flex-grow bg-panel-background font-poppins">
        <DashboardMain v-show="dashboardPinia.view === 'dashboard'"/>
        <StudentsMain v-show="dashboardPinia.view === 'students'"/>
        <ContentMain v-show="dashboardPinia.view === 'content'"/>
        <AccountMain v-show="dashboardPinia.view === 'account'"/>
        <SettingsMain v-show="dashboardPinia.view === 'settings'"/>
      </div>
    </div>
  </div>
</template>
