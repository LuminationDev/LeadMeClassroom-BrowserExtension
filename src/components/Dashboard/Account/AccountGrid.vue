<script setup lang="ts">
import AccountGridItem from "./AccountGridItem.vue";
import {required, helpers, minLength} from "@vuelidate/validators";
import LoginTextInput from "../../Popup/Login/LoginTextInput.vue";
import useVuelidate from "@vuelidate/core";
import {ref} from "vue";
import GenericButton from "../../Buttons/GenericButton.vue";

import {useDashboardStore} from "../../../stores/dashboardStore";
const dashboardPinia = useDashboardStore();

const changed = ref(false);
const name = ref('');
const password = ref('');
const rules = {
  name: {
    required: helpers.withMessage("Name is required", required),
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

const v$ = useVuelidate(rules, { password, name })

async function validatePassword() {
  const result = await v$.value.password.$validate();
  if (!result) { return; }

  console.log(password.value);
  await dashboardPinia.changeUserPassword(password.value);

  password.value = '';
  v$.value.$reset();
  changed.value = true;
}

async function validateAndSubmit() {
  const result = await v$.value.name.$validate();
  if (!result) { return; }

  await dashboardPinia.changeDisplayName(name.value);

  name.value = '';
  v$.value.$reset();
  changed.value = true;
}

async function changeMarketing() {
  await dashboardPinia.changeMarketingPreference(dashboardPinia.marketing === null);
  changed.value = true;
}

function changeView(view: string) {
  changed.value = false;
  dashboardPinia.changeAccountView(view)
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

      <LoginTextInput v-model="v$.password.$model" :v$="v$.password" v-on:focusin="changed = false" class="mb-3" type="text" placeholder="New password"/>

      <GenericButton class="flex justify-center items-center" :type="'primary'" :callback="validatePassword">
        <img v-if="changed" class="w-8 h-8" src="@/assets/img/tick.svg" alt="Icon"/>
        <p v-else>Confirm</p>
      </GenericButton>
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
      <AccountGridItem :title="'Back'" v-on:click="changeView('menu')"/>

      <p class="text-base mb-3 text-black">Email subscription:
        <span :class="{
          'text-green-400': dashboardPinia.marketing,
          'text-red-400': !dashboardPinia.marketing,
        }"
        >{{dashboardPinia.marketing ? "Enabled" : "Disabled"}}
        </span>
      </p>

      <GenericButton class="flex justify-center items-center" :type="'primary'" :callback="changeMarketing">
        <img v-if="changed" class="w-8 h-8" src="@/assets/img/tick.svg" alt="Icon"/>
        <p v-else>Change</p>
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
