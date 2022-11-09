<script setup>
import { usePopupStore } from "@/stores/popupStore.ts";
let popupPinia = usePopupStore();

function closePopup ()
{
  window.close();
}
</script>

<template>
  <div class="flex justify-between">
    <div v-if="!popupPinia.showHeaderIcon()">
      <img class="w-24 h-14 ml-6" src="@/assets/img/icon-popup-header.svg" alt="LeadMe Icon"/>
    </div>

    <span
        v-else
        class="mr-6 mt-3 ml-6 text-base cursor-pointer"
        v-on:click="popupPinia.back">back</span>

    <span
        class="mr-6 mt-3 text-base cursor-pointer"
        v-on:click="closePopup">x</span>
  </div>
</template>
