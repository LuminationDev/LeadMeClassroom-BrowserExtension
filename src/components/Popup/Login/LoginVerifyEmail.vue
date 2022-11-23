<script setup lang="ts">
import Spinner from "./Spinner.vue";
import PopupSecondaryButton from "../../../components/Buttons/PopupSecondaryButton.vue";

import { usePopupStore } from "../../../stores/popupStore";
const popupPinia = usePopupStore();

function submit() {
  popupPinia.resendVerificationEmail()
}
</script>

<template>
  <form @submit.prevent="submit" class="mt-6 pb-5">
    <div class="mb-2">
      Your email has not been verified. Please verify it to continue
    </div>

    <!--Display a spinner while waiting for a response-->
    <PopupSecondaryButton v-on:click="submit">
      <p v-if="!popupPinia.loading">Resend Email</p>

      <Spinner
          v-if="popupPinia.loading"
          class="flex justify-center"
      />

    </PopupSecondaryButton>
  </form>
</template>
