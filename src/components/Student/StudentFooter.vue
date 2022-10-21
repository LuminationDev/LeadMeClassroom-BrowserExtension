<script setup>
import { usePopupStore } from "@/stores/popupStore.ts";
let popupPinia = usePopupStore();
</script>

<template>
  <div class="h-16 flex justify-around bg-white font-bold font-poppins text-sm">
    <button v-on:click="
      popupPinia.view !== 'permissions' && popupPinia.view !== 'leave'
      ?
      popupPinia.view = 'sessionStudent'
      :
      popupPinia.view = 'options'
    ">back</button>

    <button v-show="popupPinia.view !== 'permissions'" v-on:click="popupPinia.view = 'options'">options</button>
    <button v-show="popupPinia.view === 'permissions'" v-on:click="popupPinia.handleEndSessionClick()">leave session</button>
  </div>
</template>