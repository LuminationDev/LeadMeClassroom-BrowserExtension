<script setup>
import LeadMeHeader from "./PopupHeader.vue";
import PopupPanel from "./PopupPanel.vue";
import LoginContent from "@/components/Login/LoginInitial.vue";
import LoginStudent from "@/components/Login/LoginStudent.vue";
import LoginTeacher from "@/components/Login/LoginTeacher.vue";
import LoginSignup from "@/components/Login/LoginSignup.vue";
import LoginRoomCode from "@/components/Login/LoginRoomCode.vue";
import StudentSession from "@/components/Student/StudentSession.vue";
import StudentFooter from "@/components/Student/StudentFooter.vue";
import StudentOptions from "@/components/Student/StudentOptions.vue";
import StudentPermissions from "@/components/Student/StudentPermissions.vue";
import StudentSessionLeave from "@/components/Student/StudentSessionLeave.vue";
import TeacherPopupSession from "@/components/Teacher/TeacherPopupSession.vue";
import TeacherPopupFooter from "@/components/Teacher/TeacherPopupFooter.vue";

import { usePopupStore } from "@/stores/popupStore.ts";
import { onBeforeMount } from "vue";
let popupPinia = usePopupStore();

onBeforeMount(() => popupPinia.onOpen());
</script>

<template>
  <LeadMeHeader />

  <!-- Basic login panel to start with -->
  <PopupPanel v-show="popupPinia.view === 'login'">
    <template v-slot:header>Login</template>
    <template v-slot:content><LoginContent /></template>
  </PopupPanel>

  <!-- Teacher login -->
  <PopupPanel v-show="popupPinia.view === 'loginTeacher'">
    <template v-slot:header>Log in with Email</template>
    <template v-slot:content><LoginTeacher /></template>
  </PopupPanel>

  <!-- Active Teacher Session -->
  <PopupPanel v-show="popupPinia.view === 'sessionTeacher'">
    <template v-slot:header>Teacher Session</template>
    <template v-slot:content><TeacherPopupSession /></template>
    <template v-slot:footer><TeacherPopupFooter /></template>
  </PopupPanel>

  <!-- Signup -->
  <PopupPanel v-show="popupPinia.view === 'signup'">
    <template v-slot:header>Sign up with Email</template>
    <template v-slot:content><LoginSignup /></template>
  </PopupPanel>

  <!-- Student login -->
  <PopupPanel v-show="popupPinia.view === 'loginStudent'">
    <template v-slot:header>Student Login</template>
    <template v-slot:content><LoginStudent /></template>
  </PopupPanel>

  <!-- Room code -->
  <PopupPanel v-show="popupPinia.view === 'roomCode'">
    <template v-slot:header>Room Code</template>
    <template v-slot:content><LoginRoomCode /></template>
  </PopupPanel>

  <!-- Active Student Session -->
  <PopupPanel v-show="popupPinia.view === 'sessionStudent'">
    <template v-slot:header>Awaiting instruction...</template>
    <template v-slot:content><StudentSession /></template>
    <template v-slot:footer><StudentFooter /></template>
  </PopupPanel>

  <!-- Options menu (Active Student session) -->
  <PopupPanel v-show="popupPinia.view === 'options'">
    <template v-slot:header>Options</template>
    <template v-slot:content><StudentOptions /></template>
    <template v-slot:footer><StudentFooter /></template>
  </PopupPanel>

  <!-- Permissions menu (Active Student session) -->
  <PopupPanel v-show="popupPinia.view === 'permissions'">
    <template v-slot:header>Permissions</template>
    <template v-slot:content><StudentPermissions /></template>
    <template v-slot:footer><StudentFooter class="h-student-options-small" /></template>
  </PopupPanel>

  <!-- Leave session (Active Student session) -->
  <PopupPanel v-show="popupPinia.view === 'leave'">
    <template v-slot:header>Confirmation</template>
    <template v-slot:content><StudentSessionLeave /></template>
    <template v-slot:footer><StudentFooter /></template>
  </PopupPanel>
</template>