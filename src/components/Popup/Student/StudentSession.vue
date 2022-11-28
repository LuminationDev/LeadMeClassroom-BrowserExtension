<script setup lang="ts">
import { usePopupStore } from "../../../stores/popupStore";
let popupPinia = usePopupStore();
</script>

<template>
  <div class="mt-1 mb-14">
    <div class="h-56 flex flex-col justify-center items-center">
      <img class="w-48 h-40 mb-9" src="@/assets/img/happy_col.png" alt=""/>
      <p class="text-base">You can close me!</p>
    </div>
  </div>
</template>
