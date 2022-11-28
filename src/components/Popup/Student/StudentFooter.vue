<script setup lang="ts">
import { usePopupStore } from "../../../stores/popupStore";
let popupPinia = usePopupStore();
</script>

<template>
  <div class="h-16 flex justify-around bg-white font-bold font-poppins text-sm">
    <button
      v-show="popupPinia.view !== 'sessionStudent'"
      v-on:click="
        popupPinia.view !== 'permissions' && popupPinia.view !== 'leave'
        ?
        popupPinia.changeView('sessionStudent')
        :
        popupPinia.changeView('options')
      "
    >Return</button>

    <button
        v-show="popupPinia.view !== 'leave' &&
          popupPinia.view !== 'permissions' &&
          popupPinia.view !== 'options'"
        v-on:click="popupPinia.changeView('options')">Options</button>
    <button v-show="popupPinia.view === 'leave'" v-on:click="popupPinia.handleEndSessionClick()">Leave Session</button>
  </div>
</template>