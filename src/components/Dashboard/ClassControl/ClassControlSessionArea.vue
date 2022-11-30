<script setup lang="ts">
import { useDashboardStore } from "../../../stores/dashboardStore";
import GenericButton from "../../Buttons/GenericButton.vue";
let dashboardPinia = useDashboardStore();

async function endSession() {
  await dashboardPinia.endSession();
}

async function generateSession() {
  await dashboardPinia.generateSession();
}
</script>

<template>
  <div class="mt-9 mr-12 absolute right-0">
    <GenericButton
        v-if="dashboardPinia.classCode"
        class="h-12 w-40 bg-white text-base
        text-red-end-class font-poppins font-semibold
        rounded-md border-2 border-red-end-class"
        :callback="endSession"
        :spinnerColor="'#000000'"
    >End Class</GenericButton>

    <button
        v-if="dashboardPinia.classCode"
        class="ml-3 h-12 w-56 bg-navy-side-menu
        text-base text-white font-poppins font-semibold
        rounded-md"
    >Class Code: {{ dashboardPinia.classCode }}</button>

    <GenericButton
        v-else
        id="generate_class"
        class="ml-3 h-12 w-56 bg-navy-side-menu
        text-base text-white font-poppins font-medium
        rounded-md"
        :callback="generateSession"
    >Start Class</GenericButton>
  </div>
</template>
