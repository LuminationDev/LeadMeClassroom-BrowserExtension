<script setup lang="ts">
import AccountGridItem from "./AccountGridItem.vue";
import {required, helpers, minLength, email as emailRule} from "@vuelidate/validators";
import LoginTextInput from "../../InputFields/TextInput.vue";
import LoginPasswordInput from "../../InputFields/PasswordInput.vue";
import useVuelidate from "@vuelidate/core";
import {ref} from "vue";
import GenericButton from "../../Buttons/GenericButton.vue";

import {useDashboardStore} from "../../../stores/dashboardStore";
import LoginEmail from "../../InputFields/EmailInput.vue";
const dashboardPinia = useDashboardStore();

const response = ref('');
const error = ref('');
const passwordView = ref('change');
const changed = ref(false);
const name = ref('');
const email = ref('');
const oldPassword = ref('');
const password = ref('');
const rules = {
  name: {
    required: helpers.withMessage("Name is required", required),
    $autoDirty: true
  },
  email: {
    required: helpers.withMessage("Email is required", required),
    emailRule: helpers.withMessage("Email must be a valid email address", emailRule),
    $lazy: true
  },
  oldPassword: {
    required: helpers.withMessage("Current password is required", required),
    $autoDirty: true
  },
  password: {
    required: helpers.withMessage("Password is required", required),
    minLength: helpers.withMessage("Password must be at least 8 characters", minLength(8)),
    specialCharacters: helpers.withMessage("Password must have a special character", helpers.regex(/^(?=.*[*.!@#$%^&(){}\[\]:;<>,.?\/~_\+\-=|]).*$/)),
    lowerCase: helpers.withMessage("Password must have a lowercase letter", helpers.regex(/^(?=.*[a-z]).*$/)),
    upperCase: helpers.withMessage("Password must have an uppercase letter", helpers.regex(/^(?=.*[A-Z]).*$/)),
    numbers: helpers.withMessage("Password must have at least one number", helpers.regex(/^(?=.*[0-9]).*$/))
  },
}

const v$ = useVuelidate(rules, { name, email, oldPassword, password })

async function validateEmail() {
  const result = await v$.value.email.$validate();
  if (!result) { return; }

  const success = await dashboardPinia.handlePasswordReset(email.value);
  if(success !== 'success') {
    error.value = success;
    return;
  }

  error.value = '';
  response.value = 'We have sent a password recovery link to your email.';
  email.value = '';
  v$.value.$reset();
  resetChanged();
}

async function validatePassword() {
  const emailResult = await v$.value.email.$validate();
  const oldResult = await v$.value.oldPassword.$validate();
  const passwordResult = await v$.value.password.$validate();
  if (!emailResult || !oldResult || !passwordResult) { return; }

  const success = await dashboardPinia.changeUserPassword(email.value, oldPassword.value, password.value);
  if(success !== 'success') {
    error.value = success;
    return;
  }

  error.value = '';
  response.value = 'Your password has been updated!';
  email.value = '';
  oldPassword.value = '';
  password.value = '';
  v$.value.$reset();
  resetChanged();
}


async function validateAndSubmit() {
  const result = await v$.value.name.$validate();
  if (!result) { return; }

  await dashboardPinia.changeDisplayName(name.value);

  name.value = '';
  v$.value.$reset();
  resetChanged();
}

async function changeMarketing() {
  await dashboardPinia.changeMarketingPreference(dashboardPinia.marketing === null);
  resetChanged();
}

function resetChanged() {
  changed.value = true;
  setTimeout(() => { changed.value = false; }, 2000);
}

/**
 * Swap between the change password and forgot password fields whilst resetting the validation and input fields.
 * @param view
 */
function changePasswordView(view: string) {
  clearFields();
  v$.value.$reset();
  passwordView.value = view;
}

function changeView(view: string) {
  clearFields();
  changed.value = false;
  dashboardPinia.changeAccountView(view);
}

function clearFields() {
  response.value = '';
  error.value = '';
  email.value = '';
  password.value = '';
  v$.value.$reset();
}
</script>

<template>
  <Transition name="fade" mode="out-in">
    <div v-if="dashboardPinia.accountView === 'menu'">
      <AccountGridItem :title="'Reset password'" v-on:click="changeView('resetPassword')"/>
      <AccountGridItem :title="'Change name'" v-on:click="changeView('changeName')"/>
      <AccountGridItem :title="'Email subscription'" v-on:click="changeView('changeSubscription')"/>
    </div>

    <!--Resetting password page-->
    <div v-else-if="dashboardPinia.accountView === 'resetPassword'">
      <AccountGridItem :title="'Back'" v-on:click="changeView('menu')"/>

      <!--Change password area-->
      <div v-if="passwordView === 'change'">
        <!--Account email-->
        <LoginEmail v-model="email" :v$="v$.email" class="mb-3" placeholder="Email" />

        <!--Old password-->
        <LoginPasswordInput v-model="oldPassword" :v$="v$.oldPassword" class="mb-3" placeholder="Old Password"/>

        <!--New password-->
        <LoginPasswordInput v-model="v$.password.$model" :v$="v$.password" v-on:focusin="changed = false" placeholder="New password"/>

        <p class="w-64 px-1 text-red-400 mb-3">{{ error }}</p>
        <p class="w-64 px-1 text-green-400 mb-3">{{ response }}</p>

        <GenericButton class="flex justify-center items-center" :type="'primary'" :callback="validatePassword">
          <img v-if="changed" class="w-8 h-8" src="@/assets/img/tick.svg" alt="Icon"/>
          <p v-else>Reset Password</p>
        </GenericButton>

        <p
            class="mb-3 font-medium text-blue-400 cursor-pointer"
            v-on:click="changePasswordView('forgot')"
        >Forgot password?</p>
      </div>

      <!--Forgot password area-->
      <div v-else-if="passwordView === 'forgot'">
        <!--Forgot password area-->
        <!--Account email-->
        <LoginEmail v-model="email" :v$="v$.email" placeholder="Email" />

        <p class="w-64 px-1 text-red-400 mb-3">{{ error }}</p>
        <p class="w-64 px-1 text-green-400 mb-3">{{ response }}</p>

        <GenericButton class="flex justify-center items-center" :type="'primary'" :callback="validateEmail">
          <img v-if="changed" class="w-8 h-8" src="@/assets/img/tick.svg" alt="Icon"/>
          <p v-else>Forgot password</p>
        </GenericButton>

        <p
            class="mb-3 font-medium text-blue-400 cursor-pointer"
            v-on:click="changePasswordView('change')"
        >Change password?</p>
      </div>
    </div>

    <!--Changing display name page-->
    <div v-else-if="dashboardPinia.accountView === 'changeName'">
      <AccountGridItem :title="'Back'" v-on:click="changeView('menu')"/>

      <LoginTextInput v-model="name" :v$="v$.name" v-on:focusin="changed = false" class="mb-3" type="text" placeholder="Display name"/>
      <GenericButton class="flex justify-center items-center" :type="'primary'" :callback="validateAndSubmit">
        <img v-if="changed" class="w-8 h-8" src="@/assets/img/tick.svg" alt="Icon"/>
        <p v-else>Confirm</p>
      </GenericButton>
    </div>

    <!--Marketing page-->
    <div v-else-if="dashboardPinia.accountView === 'changeSubscription'">
      <AccountGridItem class="mb-10" :title="'Back'" v-on:click="changeView('menu')"/>

      <p class="text-base mb-3 text-black font-semibold">Email subscription</p>
      <p class="mb-3 text-sm text-black">Receive emails about product updates, new features and offerings from LeadMe</p>
      <p class="text-sm mb-10 text-black">Status:
        <span :class="{
          'text-green-400': dashboardPinia.marketing,
          'text-red-400': !dashboardPinia.marketing,
        }"
        >{{dashboardPinia.marketing ? "Subscribed" : "Not subscribed"}}
        </span>
      </p>

      <GenericButton class="flex justify-center items-center" :type="'primary'" :callback="changeMarketing">
        <img v-if="changed" class="w-8 h-8" src="@/assets/img/tick.svg" alt="Icon"/>
        <p v-else>{{dashboardPinia.marketing ? "Unsubscribe" : "Subscribe"}}</p>
      </GenericButton>
    </div>
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
