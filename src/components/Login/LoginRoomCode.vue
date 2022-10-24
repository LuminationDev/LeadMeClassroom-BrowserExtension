<script setup>
import LoginCodeInput from "./LoginCodeInput.vue";
import PopupSecondaryButton from "@/components/Buttons/PopupSecondaryButton.vue";
import {ref} from "vue";

import { usePopupStore } from "@/stores/popupStore.ts";
let popupPinia = usePopupStore();

const error = ref("");
const authorise = ref(false);

function checkInputs() {
  popupPinia.changeView('sessionStudent');
  return;

  resetErrorMessages();
  if(!popupPinia.checkCodeInput()) {
    error.value = "Ensure all inputs are filled.";
    return;
  }

  if(!authorise.value) {
    error.value = "Please authorise the permissions.";
    return;
  }

  popupPinia.connect();
}

function resetErrorMessages() {
  error.value = "";
  popupPinia.classError = "";
}
</script>

<template>
  <div class="mt-9 pb-7">

    <div class="mb-11 ml-3 child:mr-3">
      <LoginCodeInput v-model="popupPinia.codeValues.input1" />
      <LoginCodeInput v-model="popupPinia.codeValues.input2" />
      <LoginCodeInput v-model="popupPinia.codeValues.input3" />
      <LoginCodeInput v-model="popupPinia.codeValues.input4" />
    </div>

    <label class="inline-flex items-center mb-4">
      <input class="w-4 h-4" v-model="authorise" type="checkbox"/>
      <p class="w-56 ml-4 text-xsm text-left text-gray-popup-text">I authorise the <span class="underline underline-offset-1">permissions</span> necessary for LeadMe Classroom to function</p>
    </label>

    <PopupSecondaryButton v-on:click="checkInputs()">Enter</PopupSecondaryButton>
    <p class="text-red-400">{{ error }}</p>
    <p class="text-red-400">{{ popupPinia.classError }}</p>

    <p class="mt-14 text-gray-separator cursor-pointer" v-on:click="popupPinia.changeView('loginTeacher')">Teacher Login</p>
  </div>
</template>
