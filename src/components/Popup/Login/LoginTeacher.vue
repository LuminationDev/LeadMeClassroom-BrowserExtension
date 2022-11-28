<script setup lang="ts">
import LoginTextInput from "./LoginTextInput.vue";
import { ref } from "vue";
import { email as emailRule, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

import { usePopupStore } from "../../../stores/popupStore";
import GenericButton from "../../Buttons/GenericButton.vue";
import LoginEmail from "./LoginEmail.vue";

const popupPinia = usePopupStore();

const email = ref("")
const password = ref("")

const rules = {
  password: { required },
  email: { required, emailRule, $lazy: true, $autoDirty: false }
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
  <form @submit.prevent="validateAndSubmit" class="mt-6 pb-5">
    <div v-if="popupPinia.justCreatedAccount">Thanks for signing up, please verify your email and login to get started</div>
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
