<script setup lang="ts">
import { useDashboardStore } from "../../../stores/dashboardStore";
let dashboardPinia = useDashboardStore();
</script>

<template>
  <div class="mt-9 mr-12 absolute right-0">
    <button
        v-if="dashboardPinia.classCode"
        v-on:click="dashboardPinia.endSession()"
        class="h-12 w-40 bg-white text-base
        text-red-end-class font-poppins font-bold
        rounded-md border-2 border-red-end-class"
    >End Class</button>

    <button
        v-if="dashboardPinia.classCode"
        class="ml-3 h-12 w-56 bg-navy-side-menu
        text-base text-white font-poppins font-bold
        rounded-md"
    >Class Code: {{ dashboardPinia.classCode }}</button>

    <button
        v-else
        id="generate_class"
        v-on:click="dashboardPinia.generateSession()"
        class="ml-3 h-12 w-56 bg-navy-side-menu
        text-base text-white font-poppins font-bold
        rounded-md"
    >Start Class</button>
  </div>
</template>
