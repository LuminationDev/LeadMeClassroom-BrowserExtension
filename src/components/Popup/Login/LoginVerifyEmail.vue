<script setup lang="ts">
import { usePopupStore } from "../../../stores/popupStore";
import GenericButton from "../../Buttons/GenericButton.vue";
const popupPinia = usePopupStore();

async function submit() {
  await popupPinia.resendVerificationEmail()
}
</script>

<template>
  <form @submit.prevent="submit" class="mt-6 pb-5">
    <div class="mb-2">
      Your email has not been verified. Please verify it to continue
    </div>

    <!--Display a spinner while waiting for a response-->
    <GenericButton :type="'secondary'" :callback="submit">Resend Email</GenericButton>
  </form>
</template>
