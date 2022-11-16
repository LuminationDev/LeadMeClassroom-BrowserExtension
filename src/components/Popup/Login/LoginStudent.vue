<script setup>
import PopupSecondaryButton from "@/components/Buttons/PopupSecondaryButton.vue";
import LoginTextInput from "@/components/Popup/Login/LoginTextInput.vue";

import {usePopupStore} from "@/stores/popupStore.ts";
import {computed} from "vue";
import {required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
let popupPinia = usePopupStore();

const name = computed(() => {
  return popupPinia.follower.name
})

const rules = {
  name: { required, $autoDirty: true }
}

const v$ = useVuelidate(rules, { name })

function validateAndSubmit() {
  !v$.value.$validate().then((result) => {
    if (!result) {
      return;
    }
    popupPinia.changeView('roomCode')
  })
}
</script>

<template>
  <div class="mt-9 pb-7">
    <div class="mb-4">
      <LoginTextInput v-model="popupPinia.follower.name" :v$="v$.name" class="text-center" type="text" placeholder="Student Name"/>
      <p class="text-red-400">{{ popupPinia.error }}</p>
    </div>

    <PopupSecondaryButton v-on:click="validateAndSubmit">Confirm</PopupSecondaryButton>

    <p class="mt-24 text-gray-separator cursor-pointer" v-on:click="popupPinia.changeView('loginTeacher')">Teacher Login</p>
  </div>
</template>
