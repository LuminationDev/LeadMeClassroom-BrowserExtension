<script setup lang="ts">
import LoginTextInput from "../../../components/Popup/Login/LoginTextInput.vue";
import { computed } from "vue";
import {helpers, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import GenericButton from "../../Buttons/GenericButton.vue";

import { usePopupStore } from "../../../stores/popupStore";
const popupPinia = usePopupStore();

const name = computed(() => {
  return popupPinia.follower.name
})

const rules = {
  name: {
    required: helpers.withMessage("Name is required", required),
    $autoDirty: true
  }
}

const v$ = useVuelidate(rules, { name })

async function validateAndSubmit() {
  const result = await v$.value.$validate();
  if (!result) { return; }

  await popupPinia.changeView('roomCode');
}
</script>

<template>
  <form class="mt-9 pb-7" @submit.prevent>
    <div class="mb-4">
      <LoginTextInput v-model="popupPinia.follower.name" :v$="v$.name" class="text-center" type="text" placeholder="Student Name"/>
      <p class="text-red-400">{{ popupPinia.error }}</p>
    </div>

    <GenericButton :type="'secondary'" :callback="validateAndSubmit">Confirm</GenericButton>

    <p class="mt-24 text-gray-separator cursor-pointer" v-on:click="popupPinia.changeView('loginTeacher')">Teacher Login</p>
  </form>
</template>
