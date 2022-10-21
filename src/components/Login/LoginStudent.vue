<script setup>
import PopupSecondaryButton from "@/components/Buttons/PopupSecondaryButton.vue";

import { usePopupStore } from "@/stores/popupStore.ts";
import LoginTextInput from "@/components/Login/LoginTextInput.vue";
let popupPinia = usePopupStore();
</script>

<template>
  <div class="mt-9 pb-7">
    <LoginTextInput class="mb-4 text-center" placeholder="Student Name"/>

    <PopupSecondaryButton v-on:click="popupPinia.changeView('roomCode')">Confirm</PopupSecondaryButton>

    <p class="mt-24 text-gray-separator cursor-pointer" v-on:click="popupPinia.changeView('loginTeacher')">Teacher Login</p>
  </div>
</template>
