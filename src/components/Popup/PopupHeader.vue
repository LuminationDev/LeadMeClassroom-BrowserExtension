<script setup>
import { usePopupStore } from "@/stores/popupStore.ts";
let popupPinia = usePopupStore();
</script>

<template>
  <div class="flex justify-between">
    <div>
      <img class="w-24 h-14 ml-6" src="@/assets/img/icon-popup-header.svg" alt="LeadMe Icon"/>
    </div>

    <span
        v-if="popupPinia.showHeaderIcon()"
        class="mr-6 mt-3 text-base cursor-pointer"
        v-on:click="popupPinia.view = 'login'">x</span>
  </div>
</template>
