<script setup lang="ts">
import PopupSecondaryButton from "../../../components/Buttons/PopupSecondaryButton.vue";
import LoginTextInput from "../../../components/Popup/Login/LoginTextInput.vue";
import { ref } from "vue";
import { usePopupStore } from "../../../stores/popupStore";
import useVuelidate from "@vuelidate/core";
import { required, email as emailRule } from "@vuelidate/validators";

let popupPinia = usePopupStore();

const email = ref("")

const rules = {
  email: { required, emailRule, $lazy: true }
}

const v$ = useVuelidate(rules, { email })

function validateAndSubmit() {
  !v$.value.$validate().then((result) => {
    if (!result) {
      return;
    }
    popupPinia.handlePasswordReset(email.value)
  })
}
</script>

<template>
  <div class="mt-6 pb-5">
    <div class="mb-4">
      <LoginTextInput v-model="email" class="pl-3.5" type="text" placeholder="Email"/>
      <p class="text-red-400">{{ popupPinia.error }}</p>
    </div>

    <PopupSecondaryButton
        class="mb-3 text-blue-500 bg-white border border-blue-500 border-3"
        v-on:click="popupPinia.changeView('loginTeacher')"
    >
      Cancel
    </PopupSecondaryButton>
    <PopupSecondaryButton class="mb-24" v-on:click="validateAndSubmit">Send</PopupSecondaryButton>
  </div>
</template>
