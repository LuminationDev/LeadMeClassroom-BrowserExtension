<script setup lang="ts">
import AccountGridItem from "./AccountGridItem.vue";
import {required, helpers} from "@vuelidate/validators";
import LoginTextInput from "../../Popup/Login/LoginTextInput.vue";
import useVuelidate from "@vuelidate/core";
import {ref} from "vue";

import {useDashboardStore} from "../../../stores/dashboardStore";
import GenericButton from "../../Buttons/GenericButton.vue";
const dashboardPinia = useDashboardStore();

const name = ref('');
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

  await dashboardPinia.changeDisplayName(name.value);
}
</script>

<template>
  <Transition name="fade" mode="out-in">
    <div v-if="dashboardPinia.accountView === 'menu'">
      <AccountGridItem :title="'Reset password'"/>
      <AccountGridItem :title="'Change name'" v-on:click="dashboardPinia.changeAccountView('changeName')"/>
      <AccountGridItem :title="'Other setting'"/>
    </div>

    <div v-else-if="dashboardPinia.accountView === 'changeName'">
      <AccountGridItem :title="'Back'" v-on:click="dashboardPinia.changeAccountView('menu')"/>

      <LoginTextInput v-model="name" :v$="v$.name" class="mb-3" type="text" placeholder="Display Name"/>
      <GenericButton :type="'primary'" :callback="validateAndSubmit">Confirm</GenericButton>
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
