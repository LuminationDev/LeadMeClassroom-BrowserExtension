<script setup lang="ts">
import LeadMeHeader from "./PopupHeader.vue";
import PopupPanel from "./PopupPanel.vue";
import PopupLoading from "./PopupLoading.vue";
import PopupFooter from "./PopupFooter.vue";
import LoginContent from "../../components/Popup/Login/LoginInitial.vue";
import LoginStudent from "../../components/Popup/Login/LoginStudent.vue";
import LoginRoomCode from "../../components/Popup/Login/LoginRoomCode.vue";
import StudentSession from "../../components/Popup/Student/StudentSession.vue";
import StudentFooter from "../../components/Popup/Student/StudentFooter.vue";
import StudentOptions from "../../components/Popup/Student/StudentOptions.vue";
import StudentPermissions from "../../components/Popup/Student/StudentPermissions.vue";
import StudentSessionLeave from "../../components/Popup/Student/StudentSessionLeave.vue";
import { onBeforeMount } from "vue";

import { usePopupStore } from "../../stores/popupStore";
const popupPinia = usePopupStore();

onBeforeMount(() => popupPinia.onOpen());
</script>

<template>
  <LeadMeHeader />

  <div class="bg-panel-background">
    <Transition name="fade" mode="out-in">
      <!-- Loading panel -->
      <PopupPanel v-if="popupPinia.view === 'loading'">
        <template v-slot:header><span class="font-semibold">Loading please wait!</span></template>
        <template v-slot:content><PopupLoading /></template>
        <template v-slot:footer><PopupFooter /></template>
      </PopupPanel>

      <!-- Basic login panel to start with -->
      <PopupPanel v-else-if="popupPinia.view === 'login'">
        <template v-slot:header><span class="font-semibold">Welcome to LeadMe!</span></template>
        <template v-slot:content><LoginContent /></template>
      </PopupPanel>

      <!-- Student login -->
      <PopupPanel v-else-if="popupPinia.view === 'loginStudent'">
        <template v-slot:header>Student Login</template>
        <template v-slot:content><LoginStudent /></template>
      </PopupPanel>

      <!-- Room code -->
      <PopupPanel v-else-if="popupPinia.view === 'roomCode'">
        <template v-slot:header>Room Code</template>
        <template v-slot:content><LoginRoomCode /></template>
      </PopupPanel>

      <!-- Active Student Session -->
      <PopupPanel v-else-if="popupPinia.view === 'sessionStudent'">
        <template v-slot:content><StudentSession /></template>
        <template v-slot:footer><StudentFooter /></template>
      </PopupPanel>

      <!-- Options menu (Active Student session) -->
      <PopupPanel v-else-if="popupPinia.view === 'options'">
        <template v-slot:header>Options</template>
        <template v-slot:content><StudentOptions /></template>
        <template v-slot:footer><StudentFooter /></template>
      </PopupPanel>

      <!-- Permissions menu (Active Student session) -->
      <PopupPanel v-else-if="popupPinia.view === 'permissions'">
        <template v-slot:header>Permissions</template>
        <template v-slot:content><StudentPermissions /></template>
        <template v-slot:footer><StudentFooter /></template>
      </PopupPanel>

      <!-- Leave session (Active Student session) -->
      <PopupPanel v-else-if="popupPinia.view === 'leave'">
        <template v-slot:header>Confirmation</template>
        <template v-slot:content><StudentSessionLeave /></template>
        <template v-slot:footer><StudentFooter /></template>
      </PopupPanel>
    </Transition>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
