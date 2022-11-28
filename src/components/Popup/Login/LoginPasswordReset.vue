<script setup lang="ts">
import PopupSecondaryButton from "../../../components/Buttons/PopupSecondaryButton.vue";
import LoginTextInput from "../../../components/Popup/Login/LoginTextInput.vue";
import LoginEmail from "./LoginEmail.vue";
import { ref } from "vue";
import useVuelidate from "@vuelidate/core";
import {required, email as emailRule, helpers} from "@vuelidate/validators";

import { usePopupStore } from "../../../stores/popupStore";
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

function validateAndSubmit() {
  !v$.value.$validate().then((result) => {
    if (!result) {
      return;
    }
    popupPinia.handlePasswordReset(email.value)
  })
}
</script>

<template>
  <form class="pb-5 flex flex-col items-center" @submit.prevent="validateAndSubmit">
    <p class="mt-2 mb-4 w-56">Enter the email address associated with your account.</p>

    <div class="mb-4">
      <LoginEmail v-model="email" :v$="v$.email" placeholder="Email" />
      <p class="text-red-400">{{ popupPinia.error }}</p>
    </div>
    
    <PopupSecondaryButton class="mb-14" v-on:click="validateAndSubmit">Submit</PopupSecondaryButton>

    <p class="mb-3 text-gray-separator cursor-pointer" v-on:click="popupPinia.changeView('loginTeacher')">Teacher Login</p>
  </form>
</template>
