<script setup lang="ts">
import PopupSecondaryButton from "../../../components/Buttons/PopupSecondaryButton.vue";
import { usePopupStore } from "../../../stores/popupStore";
const popupPinia = usePopupStore();
</script>

<template>
  <div class="pb-5 flex flex-col items-center">
    <p class="mt-2 mb-32 w-56">We have sent a password recovery link to your email.</p>

    <PopupSecondaryButton class="mb-7" v-on:click="popupPinia.changeView('login')">Return to home</PopupSecondaryButton>

    <p class="mb-3 text-gray-separator cursor-pointer" v-on:click="popupPinia.changeView('loginTeacher')">Teacher Login</p>
  </div>
</template>
