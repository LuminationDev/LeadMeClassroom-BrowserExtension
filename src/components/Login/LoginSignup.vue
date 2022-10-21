<script setup>
import PopupSecondaryButton from "@/components/Buttons/PopupSecondaryButton.vue";
import LoginTextInput from "./LoginTextInput.vue";

import { usePopupStore } from "@/stores/popupStore.ts";
let popupPinia = usePopupStore();
</script>

<template>
  <div class="mt-9 pb-7">
    <LoginTextInput class="mb-2" placeholder="Email"/>
    <LoginTextInput class="mb-3" placeholder="Password"/>

    <label class="inline-flex items-center mb-4">
      <input class="w-4 h-4" type="checkbox"/>
      <p class="w-56 ml-4 text-xsm text-left text-gray-popup-text">By signing up, I agree to LeadMe's <span class="underline  underline-offset-1">Terms and Conditions</span></p>
    </label>

    <label class="inline-flex items-center mb-4">
      <input class="w-4 h-4" type="checkbox"/>
      <p class="w-56 ml-4 text-xsm text-left text-gray-popup-text">I want to receive emails about product updates, new features and offerings from LeadMe!</p>
    </label>

    <PopupSecondaryButton>Sign up</PopupSecondaryButton>
  </div>
</template>
