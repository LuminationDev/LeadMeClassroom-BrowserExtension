<script setup lang="ts">
import LoginTextInput from "./LoginTextInput.vue";
import Spinner from "./Spinner.vue";
import PopupSecondaryButton from "../../../components/Buttons/PopupSecondaryButton.vue";
import { ref } from "vue";
import { email as emailRule, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

import { usePopupStore } from "../../../stores/popupStore";
const popupPinia = usePopupStore();

const email = ref("")
const password = ref("")

const rules = {
  password: { required },
  email: { required, emailRule, $lazy: true }
}

const v$ = useVuelidate(rules, { password, email })

function validateAndSubmit() {
  !v$.value.$validate().then((result) => {
    if (!result) {
      return;
    }
    popupPinia.handleLogin(email.value, password.value)
    v$.value.$reset()
  })
}
</script>

<template>
  <form @submit.prevent="validateAndSubmit" class="mt-6 pb-5">
    <div class="mb-8" v-if="!popupPinia.justCreatedAccount">Thanks for signing up, please verify your email and login to get started</div>
    <div class="mb-2">
      <LoginTextInput v-model="v$.email.$model" type="email" placeholder="Email" :v$="v$.email"/>
    </div>

    <div class="mb-3">
      <LoginTextInput v-model="v$.password.$model" type="password" placeholder="Password" :v$="v$.password"/>
      <p class="text-red-400">{{ popupPinia.error }}</p>
    </div>

    <!--Display a spinner while waiting for a response-->
    <PopupSecondaryButton v-on:click="validateAndSubmit">
      <p v-if="!popupPinia.loading">Sign in</p>

      <Spinner
        v-if="popupPinia.loading"
        class="flex justify-center"
      />
    </PopupSecondaryButton>

    <p
        class="text-left mt-5 mb-14 text-gray-separator cursor-pointer underline underline-offset-1"
        v-on:click="popupPinia.changeView('forgot')"
    >
      Forgot password?
    </p>

  </form>
</template>
