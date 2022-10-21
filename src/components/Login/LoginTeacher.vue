<script setup>
import PopupSecondaryButton from "@/components/Buttons/PopupSecondaryButton.vue";
import LoginTextInput from "./LoginTextInput.vue";

import { usePopupStore } from "@/stores/popupStore.ts";
import {onMounted} from "vue";
let popupPinia = usePopupStore();

onMounted(() => popupPinia.handleLogin());
</script>

<template>
  <div class="mt-9 pb-7">
<!--    <LoginTextInput class="mb-2" placeholder="Email"/>-->
<!--    <LoginTextInput class="mb-3" placeholder="Password"/>-->

    <div id="firebaseui-auth-container" class="firebase-auth"></div>

<!--    <PopupSecondaryButton>Log in</PopupSecondaryButton>-->

    <p
        class="text-left mt-5 mb-14 text-gray-separator cursor-pointer underline underline-offset-1"
        v-on:click="popupPinia.changeView('forgot')"
    >
      Forgot password?
    </p>

  </div>
</template>

<style>
.firebaseui-id-submit, mdl-button, mdl-js-button, mdl-button--raised, mdl-button--colored {
  @apply bg-button-blue;
}

.firebaseui-button {
  background-color: #1599F3 !important;
  @apply w-64 h-10 rounded-lg text-white bg-button-blue text-base;
}

.firebaseui-textfield.mdl-textfield .firebaseui-label:after {
  background-color: #ff626e !important;
}

.mdl-button {
  @apply mb-2
}

.firebaseui-link, firebaseui-id-secondary-link {
  margin-bottom: 10px !important;
  @apply text-gray-separator;
}

.mdl-textfield__input, firebaseui-input, firebaseui-id-email {
  @apply w-64 h-12 mb-2 rounded-lg border-2 px-1 text-sm border-gray-separator;
}

.mdl-textfield__label, firebaseui-label {
  @apply hidden;
}

.firebaseui-card-header {
  @apply hidden;
}

.mdl-textfield__input, firebaseui-input, firebaseui-id-password {
  @apply mb-3 border-gray-separator;
}

.mdl-progress > .progressbar {
  background-color: #ff626e !important;
}

.mdl-progress > .bufferbar {
  background-image: linear-gradient(
      90deg,
      hsla(0, 0%, 100%, 0.7),
      hsla(0, 0%, 100%, 0.7)
  ),
  linear-gradient(90deg, #ff626e, #ff626e) !important;
  z-index: 0;
  left: 0;
}

.mdl-progress:not(.mdl-progress--indeterminate) > .auxbar,
.mdl-progress:not(.mdl-progress__indeterminate) > .auxbar {
  background-image: linear-gradient(
      90deg,
      hsla(0, 0%, 100%, 0.9),
      hsla(0, 0%, 100%, 0.9)
  ),
  linear-gradient(90deg, #ff626e, #ff626e) !important;
}
</style>