<script setup lang="ts">
import { usePopupStore } from "../../../stores/popupStore";
import GenericButton from "../../Buttons/GenericButton.vue";
import { onMounted, ref} from "vue";
const popupPinia = usePopupStore();

async function submit() {
  await popupPinia.resendVerificationEmail()
}

const email = ref("");

onMounted(async () => {
  email.value = <string>await popupPinia.getUserEmail();
})
</script>

<template>
  <form @submit.prevent class="mt-6 pb-5">
    <div class="mb-10">
      Your email has not been verified. Please verify it to continue.
    </div>

    <p class="mb-10 font-semibold">{{ email }}</p>

    <!--Display a spinner while waiting for a response-->
    <GenericButton class="mb-6" :type="'secondary'" :callback="submit">Resend Email</GenericButton>
  </form>
</template>
