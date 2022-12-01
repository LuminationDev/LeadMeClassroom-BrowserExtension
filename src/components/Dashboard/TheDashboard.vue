<script setup lang="ts">
import DashboardOnboarding from "./DashboardOnboarding.vue";
import DashboardSideMenu from "./DashboardSideMenu.vue";
import DashboardTitleBar from "./DashboardTitleBar.vue";
import DashboardMain from "./ClassControl/ClassControlMain.vue";
import AccountMain from "./Account/AccountMain.vue";
import { onMounted, ref} from "vue";
import { getAuth } from "@firebase/auth";
import { useStorage } from "../../hooks/useStorage";

import { useDashboardStore } from "../../stores/dashboardStore";
const dashboardPinia = useDashboardStore();

const { getSyncStorage } = useStorage();
const emailVerified = ref(false)

//Reference to the screen monitor modal to open it externally
const childRef = ref<InstanceType<typeof DashboardOnboarding> | null>(null)
function startOnboarding() {
  childRef.value?.start();
}

//Check for any active class on load
onMounted(() => {
  const auth = getAuth()
  if (auth && auth.currentUser) {
    emailVerified.value = auth.currentUser.emailVerified
  }
  dashboardPinia.attachClassListeners(true)

  getSyncStorage("onboarding_completed").then(result => {
    if (result && result === true) { return; }
    startOnboarding()
  });
});
</script>

<template>
  <div class="flex font-poppins">
    <!--SideMenu-->
    <DashboardSideMenu />

    <div v-if="emailVerified" class="flex flex-grow flex-col h-screen">
      <!--TitleBar-->
      <DashboardTitleBar />

      <!--MainArea-->
      <div class="flex flex-col flex-grow bg-panel-background font-poppins">
        <DashboardMain v-show="dashboardPinia.view === 'dashboard'"/>
        <AccountMain v-show="dashboardPinia.view === 'account'"/>
      </div>
    </div>
    <div v-else class="flex justify-center items-center w-full">
      Your email is not verified. Please verify it to continue.
    </div>

    <DashboardOnboarding ref="childRef" />
  </div>
</template>
