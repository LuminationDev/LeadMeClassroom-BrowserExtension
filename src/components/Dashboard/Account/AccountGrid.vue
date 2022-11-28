<script setup lang="ts">
import AccountGridItem from "./AccountGridItem.vue";
import {required, helpers} from "@vuelidate/validators";
import LoginTextInput from "../../Popup/Login/LoginTextInput.vue";
import PopupSecondaryButton from "../../Buttons/PopupSecondaryButton.vue";
import useVuelidate from "@vuelidate/core";
import {ref} from "vue";

import {useDashboardStore} from "../../../stores/dashboardStore";
const dashboardPinia = useDashboardStore();

const name = ref('');
const rules = {
  name: {
    required: helpers.withMessage("Name is required", required),
    $autoDirty: true
  }
}

const v$ = useVuelidate(rules, { name })

function validateAndSubmit() {
  !v$.value.$validate().then((result) => {
    if (!result) {
      return;
    }

    dashboardPinia.changeDisplayName(name.value);
  })
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
      <PopupSecondaryButton v-on:click="validateAndSubmit">Confirm</PopupSecondaryButton>
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
