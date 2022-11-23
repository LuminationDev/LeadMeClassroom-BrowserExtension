<script setup lang="ts">
import Spinner from "./Spinner.vue";
import PopupSecondaryButton from "../../../components/Buttons/PopupSecondaryButton.vue";

import { usePopupStore } from "../../../stores/popupStore";
const popupPinia = usePopupStore();

function submit() {
  popupPinia.resendVerificationEmail()
}
</script>

<template>
  <form @submit.prevent="submit" class="mt-6 pb-5">
    <div class="mb-6">
      We have sent a password recovery link to your email.
    </div>

    <!--Display a spinner while waiting for a response-->
    <PopupSecondaryButton class="mb-24" v-on:click="submit">
      <p v-if="!popupPinia.loading">Resend Email</p>

      <Spinner
          v-if="popupPinia.loading"
          class="flex justify-center"
      />

    </PopupSecondaryButton>

    <p class="mb-3 text-gray-separator cursor-pointer" v-on:click="popupPinia.changeView('loginTeacher')">Teacher Login</p>
  </form>
</template>
