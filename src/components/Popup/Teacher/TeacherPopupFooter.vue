<script setup lang="ts">
import { usePopupStore } from "../../../stores/popupStore";
let popupPinia = usePopupStore();
</script>

<template>
  <div class="
    h-16 flex justify-around bg-white font-bold font-poppins text-sm
    hover:underline hover:decoration-blue-400 hover:decoration-4 hover:underline-offset-[18px]
  ">
    <button v-on:click="popupPinia.handleLogoutClick()">Sign out</button>
  </div>
</template>