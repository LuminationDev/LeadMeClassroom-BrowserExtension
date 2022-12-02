<script setup lang="ts">
import LoginTextInput from "../../../components/Popup/Login/LoginTextInput.vue";
import LoginEmail from "./LoginEmail.vue";
import { ref } from "vue";
import useVuelidate from "@vuelidate/core";
import {required, email as emailRule, helpers} from "@vuelidate/validators";

import { usePopupStore } from "../../../stores/popupStore";
import GenericButton from "../../Buttons/GenericButton.vue";
const popupPinia = usePopupStore();

const email = ref("")

const rules = {
  email: {
    required: helpers.withMessage("Email is required", required),
    emailRule: helpers.withMessage("Email must be a valid email address", emailRule),
    $lazy: true,
    $autoDirty: false
  }
}

const v$ = useVuelidate(rules, { email })

async function validateAndSubmit() {
  const result = await v$.value.$validate();
  if (!result) { return; }

  await popupPinia.handlePasswordReset(email.value);

  popupPinia.changeView('forgotConfirm')
}

async function resendEmail() {
  await popupPinia.handlePasswordReset(email.value);
}
</script>

<template>
  <form v-if="popupPinia.view === 'forgot'"
    class="pb-5 flex flex-col items-center"
    @submit.prevent>
    <p class="mt-2 mb-9 w-56">Enter the email address associated with your account.</p>

    <div class="mb-4">
      <LoginEmail v-model="email" :v$="v$.email" placeholder="Email" />
      <p class="text-red-400">{{ popupPinia.error }}</p>
    </div>

    <GenericButton class="mb-14" :type="'secondary'" :callback="validateAndSubmit">Submit</GenericButton>
  </form>

  <div v-else-if="popupPinia.view === 'forgotConfirm'" class="pb-5 flex flex-col items-center">
    <p class="mt-2 mb-3 w-56">We have sent a password recovery link to your email.</p>
    <p class="mb-9 font-semibold">{{ email }}</p>

    <GenericButton class="mb-20" :type="'secondary'" :callback="resendEmail">Resend Email</GenericButton>
  </div>

  <p class="pb-5 text-gray-separator cursor-pointer"
     v-on:click="popupPinia.changeView('loginTeacher')"
  >Teacher Login</p>
</template>
