<script setup>
import LoginTextInput from "./LoginTextInput.vue";
import MoonLoader from 'vue-spinner/src/MoonLoader.vue'
import PopupSecondaryButton from "@/components/Buttons/PopupSecondaryButton.vue";

import { usePopupStore } from "@/stores/popupStore.ts";
let popupPinia = usePopupStore();
</script>

<template>
  <div class="mt-6 pb-5">
    <div class="mb-2">
      <LoginTextInput v-model="popupPinia.email" class="pl-3.5" type="text" placeholder="Email"/>
    </div>

    <div class="mb-3">
      <LoginTextInput v-model="popupPinia.password" class="pl-3.5" type="password" placeholder="Password"/>
      <p class="text-red-400">{{ popupPinia.error }}</p>
    </div>

    <!--Display a spinner while waiting for a response-->
    <PopupSecondaryButton v-on:click="popupPinia.handleLogin()">
      <p v-if="!popupPinia.loading">Sign in</p>
      <MoonLoader
        class="flex justify-center"
        :loading="popupPinia.loading"
        :color="'white'"
        :size="'30px'"/>
    </PopupSecondaryButton>

    <p
        class="text-left mt-5 mb-14 text-gray-separator cursor-pointer underline underline-offset-1"
        v-on:click="popupPinia.changeView('forgot')"
    >
      Forgot password?
    </p>

  </div>
</template>
