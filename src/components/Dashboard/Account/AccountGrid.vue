<script setup lang="ts">
import AccountGridItem from "./AccountGridItem.vue";
import {required, helpers} from "@vuelidate/validators";
import LoginTextInput from "../../Popup/Login/LoginTextInput.vue";
import useVuelidate from "@vuelidate/core";
import {ref} from "vue";
import GenericButton from "../../Buttons/GenericButton.vue";

import {useDashboardStore} from "../../../stores/dashboardStore";
const dashboardPinia = useDashboardStore();

const changed = ref(false);
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
      <AccountGridItem :title="'Reset password'"/>
      <AccountGridItem :title="'Change name'" v-on:click="changeView('changeName')"/>
      <AccountGridItem :title="'Marketing preference'" v-on:click="changeView('changeMarketing')"/>
    </div>

    <div v-else-if="dashboardPinia.accountView === 'changeName'">
      <AccountGridItem :title="'Back'" v-on:click="changeView('menu')"/>

      <LoginTextInput v-model="name" :v$="v$.name" v-on:focusin="changed = false" class="mb-3" type="text" placeholder="Display Name"/>
      <GenericButton class="flex justify-center items-center" :type="'primary'" :callback="validateAndSubmit">
        <img v-if="changed" class="w-8 h-8" src="@/assets/img/tick.svg" alt="Icon"/>
        <p v-else>Confirm</p>
      </GenericButton>
    </div>

    <div v-else-if="dashboardPinia.accountView === 'changeMarketing'">
      <AccountGridItem :title="'Back'" v-on:click="changeView('menu')"/>

      <p class="text-base mb-3">{{dashboardPinia.marketing ? "Enabled" : "Disabled"}}</p>
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
