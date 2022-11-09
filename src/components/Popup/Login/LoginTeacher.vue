<script setup>
import LoginTextInput from "./LoginTextInput.vue";
import Spinner from "./Spinner.vue";
import PopupSecondaryButton from "@/components/Buttons/PopupSecondaryButton.vue";
import { ref } from "vue";
import { usePopupStore } from "@/stores/popupStore.ts";
let popupPinia = usePopupStore();

const email = ref("")
const password = ref("")

function login()
{
  popupPinia.handleLogin(email.value, password.value)
  password.value = ""
}
</script>

<template>
  <div class="mt-6 pb-5">
    <div class="mb-2">
      <LoginTextInput v-model="email" class="pl-3.5" type="email" placeholder="Email"/>
    </div>

    <div class="mb-3">
      <LoginTextInput v-model="password" class="pl-3.5" type="password" placeholder="Password"/>
      <p class="text-red-400">{{ popupPinia.error }}</p>
    </div>

    <!--Display a spinner while waiting for a response-->
    <PopupSecondaryButton v-on:click="login">
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

  </div>
</template>
