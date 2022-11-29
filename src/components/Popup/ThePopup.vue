<script setup lang="ts">
import LeadMeHeader from "./PopupHeader.vue";
import PopupPanel from "./PopupPanel.vue";
import LoginContent from "../../components/Popup/Login/LoginInitial.vue";
import LoginStudent from "../../components/Popup/Login/LoginStudent.vue";
import LoginTeacher from "../../components/Popup/Login/LoginTeacher.vue";
import LoginPasswordReset from "../../components/Popup/Login/LoginPasswordReset.vue";
import LoginSignup from "../../components/Popup/Login/LoginSignup.vue";
import LoginRoomCode from "../../components/Popup/Login/LoginRoomCode.vue";
import StudentSession from "../../components/Popup/Student/StudentSession.vue";
import StudentFooter from "../../components/Popup/Student/StudentFooter.vue";
import StudentOptions from "../../components/Popup/Student/StudentOptions.vue";
import StudentPermissions from "../../components/Popup/Student/StudentPermissions.vue";
import StudentSessionLeave from "../../components/Popup/Student/StudentSessionLeave.vue";
import TeacherPopupSession from "../../components/Popup/Teacher/TeacherPopupSession.vue";
import TeacherPopupFooter from "../../components/Popup/Teacher/TeacherPopupFooter.vue";
import LoginVerifyEmail from "./Login/LoginVerifyEmail.vue";
import { usePopupStore } from "../../stores/popupStore";
import { onBeforeMount } from "vue";
const popupPinia = usePopupStore();

onBeforeMount(() => popupPinia.onOpen());
</script>

<template>
  <LeadMeHeader />

  <div class="bg-panel-background">
    <Transition name="fade" mode="out-in">
      <!-- Basic login panel to start with -->
      <PopupPanel v-if="popupPinia.view === 'login'">
        <template v-slot:header>Welcome to LeadMe!</template>
        <template v-slot:content><LoginContent /></template>
      </PopupPanel>

      <!-- Teacher login -->
      <PopupPanel v-else-if="popupPinia.view === 'loginTeacher'">
        <template v-slot:header>Log in with Email</template>
        <template v-slot:content><LoginTeacher /></template>
      </PopupPanel>

      <!-- Forgot password & Confirmation -->
      <PopupPanel v-else-if="popupPinia.view === 'forgot' || popupPinia.view === 'forgotConfirm'">
        <template v-slot:header>
          {{popupPinia.view === 'forgot' ? 'Forgot password?' : 'Check your email!'}}
        </template>
        <template v-slot:content><LoginPasswordReset /></template>
      </PopupPanel>

      <PopupPanel v-else-if="popupPinia.view === 'verifyEmail'">
        <template v-slot:header>Verify Email</template>
        <template v-slot:content><LoginVerifyEmail /></template>
      </PopupPanel>

      <!-- Active Teacher Session -->
      <PopupPanel v-else-if="popupPinia.view === 'sessionTeacher'">
        <template v-slot:header>Teacher Session</template>
        <template v-slot:content><TeacherPopupSession /></template>
        <template v-slot:footer><TeacherPopupFooter /></template>
      </PopupPanel>

      <!-- Signup -->
      <PopupPanel v-else-if="popupPinia.view === 'signup'">
        <template v-slot:header>Sign up with Email</template>
        <template v-slot:content><LoginSignup /></template>
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
