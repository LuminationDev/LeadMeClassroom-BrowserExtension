<script setup lang="ts">
import PopupSecondaryButton from "@/components/Buttons/PopupSecondaryButton.vue";
import LoginTextInput from "./LoginTextInput.vue";
import { ref, computed } from "vue";

import { usePopupStore } from "../../../stores/popupStore";
import useVuelidate from "@vuelidate/core";
import { required, email as emailRule, sameAs, helpers, minLength } from "@vuelidate/validators";

let popupPinia = usePopupStore();

const error = ref("");
const password = ref("");
const email = ref("");
const terms = ref(false);

const name = computed(() => {
  return popupPinia.name
})

const rules = {
  password: {
    required,
    minLength: minLength(8),
    specialCharacters: helpers.withMessage("The password must have a special character", helpers.regex(/^(?=.*[*.!@$%^&(){}\[\]:;<>,.?\/~_\+\-=|]).*$/)),
    lowerCase: helpers.withMessage("The password must have a lowercase letter", helpers.regex(/^(?=.*[a-z]).*$/)),
    upperCase: helpers.withMessage("The password must have an uppercase letter", helpers.regex(/^(?=.*[A-Z]).*$/)),
    numbers: helpers.withMessage("The password must have at least one number", helpers.regex(/^(?=.*[0-9]).*$/))
  },
  email: { required, emailRule, $lazy: true },
  name: { required, $autoDirty: true },
  terms: { required, sameAs: helpers.withMessage("You must accept the terms and conditions", sameAs(true)) }
}

const v$ = useVuelidate(rules, { password, email, name, terms })

const termsModel = computed({
  get() {
    return !!v$.value.terms.$model
  },
  set(newValue) {
    // @ts-ignore
    v$.value.terms.$model = newValue
  }
})

function validateInputs() {
  !v$.value.$validate().then((result: boolean) => {
    if (!result) {
      return;
    }
    popupPinia.handleSignup(email.value, password.value);
    email.value = ''
    password.value = ''
    v$.value.$reset()
  })
}
</script>

<template>
  <div class="mt-9 pb-7">
    <div>
      <LoginTextInput class="mb-2" type="text" placeholder="Name" :v$="v$.name" v-model="popupPinia.name"/>
      <LoginTextInput class="mb-2" type="text" placeholder="Email" :v$="v$.email" v-model="v$.email.$model"/>
      <LoginTextInput class="mb-3" type="password" placeholder="Password" :v$="v$.password" v-model="v$.password.$model"/>
      <p class="text-red-400">{{ error }}</p>
    </div>

    <div class="mb-4">
      <label class="inline-flex items-center">
        <input class="w-4 h-4" type="checkbox" v-model="termsModel"/>
        <p :class="{
        'w-56 ml-4 text-xsm text-left': true,
        'text-gray-popup-text': terms,
        'text-red-800': !terms && v$.terms.$dirty
      }">By signing up, I agree to LeadMe's <span class="underline  underline-offset-1">Terms and Conditions</span></p>
      </label>
      <div v-if="v$.terms && v$.terms.$error">
        <span class="text-red-800" v-for="error in v$.terms.$errors">{{ error.$message }}</span>
      </div>
    </div>

    <label class="inline-flex items-center mb-4">
      <input class="w-4 h-4" type="checkbox"/>
      <p class="w-56 ml-4 text-xsm text-left text-gray-popup-text">I want to receive emails about product updates, new features and offerings from LeadMe!</p>
    </label>

    <PopupSecondaryButton v-on:click="validateInputs()">Sign up</PopupSecondaryButton>
    <p class="text-red-400">{{ popupPinia.error }}</p>
  </div>
</template>
