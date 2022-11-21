<script setup lang="ts">
import { usePopupStore } from "../../../stores/popupStore";
let popupPinia = usePopupStore();
</script>

<template>
  <div class="mt-9">
    <div class="h-56 text-left">
      <p class="text-sm py-4 cursor-pointer" v-on:click="popupPinia.changeView('permissions')">Permissions</p>
      <hr class="border border-white">
      <p class="text-sm py-4 cursor-pointer" v-on:click="popupPinia.changeView('leave')">Leave session</p>
      <hr class="border border-white">
    </div>
  </div>
</template>
