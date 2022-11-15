<script setup>
import PopupPrimaryButton from "@/components/Buttons/PopupPrimaryButton.vue";
import PopupSecondaryButton from "@/components/Buttons/PopupSecondaryButton.vue";

import { usePopupStore } from "@/stores/popupStore.ts";
let popupPinia = usePopupStore();
</script>

<template>
  <div class="mt-9 pb-16">
    <PopupPrimaryButton v-on:click="popupPinia.changeView('loginTeacher')">Teacher</PopupPrimaryButton>
    <PopupPrimaryButton v-on:click="popupPinia.changeView('loginStudent')">Student</PopupPrimaryButton>

    <div class="relative mb-3">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-b border-gray-separator"></div>
      </div>
      <div class="relative flex justify-center">
        <span class="bg-panel-background px-2 pb-0.5 text-sm text-gray-separator">or</span>
      </div>
    </div>

    <PopupSecondaryButton
        class="text-blue-500 bg-white border border-blue-500 border-4"
        v-on:click="popupPinia.changeView('signup')"
    >
      Sign up
    </PopupSecondaryButton>
  </div>
</template>
