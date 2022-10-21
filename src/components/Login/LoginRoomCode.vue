<script setup>
import LoginCodeInput from "./LoginCodeInput.vue";
import PopupSecondaryButton from "@/components/Buttons/PopupSecondaryButton.vue";

import { usePopupStore } from "@/stores/popupStore.ts";
let popupPinia = usePopupStore();
</script>

<template>
  <div class="mt-9 pb-7">

    <div class="mb-11">
      <LoginCodeInput v-model="popupPinia.codeValues.input1" class="mr-3" />
      <LoginCodeInput v-model="popupPinia.codeValues.input2" class="mr-3" />
      <LoginCodeInput v-model="popupPinia.codeValues.input3" class="mr-3" />
      <LoginCodeInput v-model="popupPinia.codeValues.input4" />
    </div>

    <label class="inline-flex items-center mb-4">
      <input class="w-4 h-4" type="checkbox"/>
      <p class="w-56 ml-4 text-xsm text-left text-gray-popup-text">I authorise the <span class="underline underline-offset-1">permissions</span> necessary for LeadMe Classroom to function</p>
    </label>

    <PopupSecondaryButton v-on:click="popupPinia.connect()">Enter</PopupSecondaryButton>

    <p class="mt-14 text-gray-separator cursor-pointer" v-on:click="popupPinia.changeView('loginTeacher')">Teacher Login</p>
  </div>
</template>
