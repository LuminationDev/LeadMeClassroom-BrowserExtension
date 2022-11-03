<script setup>
import PopupSecondaryButton from "@/components/Buttons/PopupSecondaryButton.vue";
import LoginTextInput from "@/components/Popup/Login/LoginTextInput.vue";

import {usePopupStore} from "@/stores/popupStore.ts";
let popupPinia = usePopupStore();
</script>

<template>
  <div class="mt-6 pb-5">
    <div class="mb-4">
      <LoginTextInput v-model="popupPinia.email" class="pl-3.5" type="text" placeholder="Email"/>
      <p class="text-red-400">{{ popupPinia.error }}</p>
    </div>

    <PopupSecondaryButton
        class="mb-3 text-button-blue bg-white border border-button-blue border-3"
        v-on:click="popupPinia.changeView('loginTeacher')"
    >
      Cancel
    </PopupSecondaryButton>
    <PopupSecondaryButton class="mb-24" v-on:click="popupPinia.handlePasswordReset()">Send</PopupSecondaryButton>
  </div>
</template>
