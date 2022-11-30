<script setup lang="ts">
import { usePopupStore } from "../../../stores/popupStore";
let popupPinia = usePopupStore();
</script>

<template>
  <div class="h-14 flex justify-around bg-white font-medium font-poppins text-sm">
    <button
        class="hover:underline hover:decoration-blue-400 hover:decoration-4 hover:underline-offset-[18px]"
      v-show="popupPinia.view !== 'sessionStudent'"
      v-on:click="popupPinia.changeView('sessionStudent')"
    >Home</button>

    <button
        class="hover:underline hover:decoration-blue-400 hover:decoration-4 hover:underline-offset-[18px]"
        v-show="popupPinia.view !== 'leave' &&
          popupPinia.view !== 'permissions' &&
          popupPinia.view !== 'options'"
        v-on:click="popupPinia.changeView('options')"
    >Options</button>

    <button
        class="hover:underline hover:decoration-blue-400 hover:decoration-4 hover:underline-offset-[18px]"
        v-show="popupPinia.view === 'leave'"
        v-on:click="popupPinia.handleEndSessionClick()"
    >Leave Session</button>
  </div>
</template>