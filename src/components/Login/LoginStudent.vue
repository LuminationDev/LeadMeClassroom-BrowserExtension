<script setup>
import PopupSecondaryButton from "@/components/Buttons/PopupSecondaryButton.vue";
import LoginTextInput from "@/components/Login/LoginTextInput.vue";
import {ref} from "vue";

import {usePopupStore} from "@/stores/popupStore.ts";

let popupPinia = usePopupStore();
const error = ref("");

function checkName() {
  (popupPinia.follower.name) ? popupPinia.changeView('roomCode') : error.value = "Please enter a name.";
}
</script>

<template>
  <div class="mt-9 pb-7">
    <div class="mb-4">
      <LoginTextInput v-model="popupPinia.follower.name" class="text-center" placeholder="Student Name"/>
      <p class="text-red-400">{{ error }}</p>
    </div>

    <PopupSecondaryButton v-on:click="checkName()">Confirm</PopupSecondaryButton>

    <p class="mt-24 text-gray-separator cursor-pointer" v-on:click="popupPinia.changeView('loginTeacher')">Teacher Login</p>
  </div>
</template>
