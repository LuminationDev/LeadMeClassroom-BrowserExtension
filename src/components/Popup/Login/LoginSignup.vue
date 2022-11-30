<script setup lang="ts">
import LoginTextInput from "./LoginTextInput.vue";
import { ref, computed } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, email as emailRule, sameAs, helpers, minLength } from "@vuelidate/validators";
import GenericButton from "../../Buttons/GenericButton.vue";
import LoginEmail from "./LoginEmail.vue";
import { usePopupStore } from "../../../stores/popupStore";
const popupPinia = usePopupStore();

const error = ref("");
const password = ref("");
const email = ref("");
const marketing = ref(false);
const terms = ref(false);

const name = computed(() => {
  return popupPinia.name
})

const rules = {
  password: {
    required: helpers.withMessage("Password is required", required),
    minLength: helpers.withMessage("Password mus be at least 8 characters", minLength(8)),
    specialCharacters: helpers.withMessage("Password must have a special character", helpers.regex(/^(?=.*[*.!@$%^&(){}\[\]:;<>,.?\/~_\+\-=|]).*$/)),
    lowerCase: helpers.withMessage("Password must have a lowercase letter", helpers.regex(/^(?=.*[a-z]).*$/)),
    upperCase: helpers.withMessage("Password must have an uppercase letter", helpers.regex(/^(?=.*[A-Z]).*$/)),
    numbers: helpers.withMessage("Password must have at least one number", helpers.regex(/^(?=.*[0-9]).*$/))
  },
  email: {
    required: helpers.withMessage("Email is required", required),
    emailRule: helpers.withMessage("Email must be a valid email address", emailRule),
    $lazy: true
  },
  name: {
    required: helpers.withMessage("Name is required", required),
    $autoDirty: true
  },
  terms: {
    required: helpers.withMessage("You must accept the terms and conditions", required),
    sameAs: helpers.withMessage("You must accept the terms and conditions", sameAs(true))
  }
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

async function validateInputs() {
  const result = await v$.value.$validate();
  if (!result) { return; }

  await popupPinia.handleSignup(email.value, password.value, marketing.value);

  email.value = ''
  password.value = ''
  v$.value.$reset()
}
</script>

<template>
  <form @submit.prevent class="mt-9 pb-7">
    <div>
      <LoginTextInput class="mb-2" type="text" placeholder="Name" :v$="v$.name" v-model="popupPinia.name"/>
      <LoginEmail class="mb-2" placeholder="Email" :v$="v$.email" v-model="email"/>
      <LoginTextInput class="mb-3" type="password" placeholder="Password" :v$="v$.password" v-model="v$.password.$model"/>
      <p class="text-red-400">{{ error }}</p>
    </div>

    <div class="mb-4 flex items-start flex-col">
      <label class="inline-flex items-center">
        <input class="w-4 h-4" type="checkbox" v-model="termsModel"/>
        <p :class="{
          'w-56 ml-4 text-xsm text-left': true,
          'text-gray-popup-text': terms,
          'text-red-800': !terms && v$.terms.$dirty
        }">By signing up, I agree to LeadMe's <a target="_blank" href="https://leadmeprivacypolicies.herokuapp.com/policies/classroom" class="underline underline-offset-1">Terms and Conditions</a></p>
      </label>
      <div class="ml-8 mt-1 text-start" v-if="v$.terms && v$.terms.$error">
        <span class="text-red-800" v-for="error in v$.terms.$errors">{{ error.$message }}</span>
      </div>
    </div>

    <label class="inline-flex items-center mb-4">
      <input class="w-4 h-4" type="checkbox" v-model="marketing"/>
      <p class="w-56 ml-4 text-xsm text-left text-gray-popup-text">I want to receive emails about product updates, new features and offerings from LeadMe!</p>
    </label>

    <GenericButton :type="'secondary'" :callback="validateInputs">Sign up</GenericButton>
    <p class="text-red-400">{{ popupPinia.error }}</p>

    <p class="mt-3 cursor-pointer text-blue-400 font-medium" v-on:click="popupPinia.changeView('loginTeacher')">
      Sign in instead?
    </p>
  </form>
</template>
