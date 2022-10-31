<script setup>
import PopupSecondaryButton from "@/components/Buttons/PopupSecondaryButton.vue";
import LoginTextInput from "./LoginTextInput.vue";
import {ref} from "vue";

import { usePopupStore } from "@/stores/popupStore.ts";
let popupPinia = usePopupStore();

const error = ref("");
const termsError = ref(false);
const name = ref("");
const email = ref("");
const password = ref("");
const authorise = ref(false);

function validateInputs() {
  resetErrors();

  if(name.value === "") {
    //Invalid name input
    error.value = "Please enter a name.";
    return;
  }

  if(!validateEmail()) {
    //Invalid email address
    error.value = "Please enter a valid email address.";
    return;
  }

  if(!validatePassword()) {
    //Password was not valid
    error.value = "Password must contain at least 6 characters.";
    return;
  }

  if(!authorise.value) {
    //Did not agree to terms and conditions
    termsError.value = true;
    return;
  }

  popupPinia.handleSignup(name.value, email.value, password.value)
}

function validateEmail() {
  return String(email.value)
      .toLowerCase()
      .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
}

function validatePassword() {
  return password.value.length > 5;
}

function resetErrors() {
  error.value = "";
  termsError.value = false;
}
</script>

<template>
  <div class="mt-9 pb-7">
    <div>
      <LoginTextInput class="mb-2" placeholder="Name" @update="newValue => name = newValue"/>
      <LoginTextInput class="mb-2" placeholder="Email" @update="newValue => email = newValue"/>
      <LoginTextInput class="mb-3" placeholder="Password" @update="newValue => password = newValue"/>
      <p class="text-red-400">{{ error }}</p>
    </div>

    <label class="inline-flex items-center mb-4">
      <input class="w-4 h-4" type="checkbox" v-model="authorise"/>
      <p :class="{
        'w-56 ml-4 text-xsm text-left': true,
        'text-gray-popup-text': !termsError.value,
        'text-red-400': termsError
      }">By signing up, I agree to LeadMe's <span class="underline  underline-offset-1">Terms and Conditions</span></p>
    </label>

    <label class="inline-flex items-center mb-4">
      <input class="w-4 h-4" type="checkbox"/>
      <p class="w-56 ml-4 text-xsm text-left text-gray-popup-text">I want to receive emails about product updates, new features and offerings from LeadMe!</p>
    </label>

    <PopupSecondaryButton v-on:click="validateInputs()">Sign up</PopupSecondaryButton>
    <p class="text-red-400">{{ popupPinia.signupError }}</p>
  </div>
</template>
