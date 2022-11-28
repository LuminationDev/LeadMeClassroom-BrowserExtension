<script setup lang="ts">
import LoginTextInput from "./LoginTextInput.vue";
import { ref } from "vue";
import {email as emailRule, helpers, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

import { usePopupStore } from "../../../stores/popupStore";
import GenericButton from "../../Buttons/GenericButton.vue";
import LoginEmail from "./LoginEmail.vue";

const popupPinia = usePopupStore();

const email = ref("")
const password = ref("")

const rules = {
  password: {
    required: helpers.withMessage("Password is required", required)
  },
  email: {
    required: helpers.withMessage("Email is required", required),
    emailRule: helpers.withMessage("Email must be a valid email address", emailRule),
    $lazy: true,
    $autoDirty: false
  }
}

const v$ = useVuelidate(rules, { password, email })

async function validateAndSubmit() {
  const result = await v$.value.$validate();
  if (!result) { return; }

  await popupPinia.handleLogin(email.value, password.value);
  v$.value.$reset();
}
</script>

<template>
  <form @submit.prevent class="mt-6 pb-5">
    <div class="mb-3" v-if="popupPinia.justCreatedAccount">Thanks for signing up, please verify your email and login to get started</div>
    <div class="mb-2">
      <LoginEmail v-model="email" :v$="v$.email" placeholder="Email" />
    </div>

    <div class="mb-3">
      <LoginTextInput v-model="v$.password.$model" type="password" placeholder="Password" :v$="v$.password"/>
      <p class="text-red-400">{{ popupPinia.error }}</p>
    </div>

    <GenericButton :type="'secondary'" :callback="validateAndSubmit">Sign in</GenericButton>

    <p
        class="text-left mt-5 mb-14 text-gray-separator cursor-pointer underline underline-offset-1"
        v-on:click="popupPinia.changeView('forgot')"
    >
      Forgot password?
    </p>

  </form>
</template>
