<script setup lang="ts">
import { usePopupStore } from "../../stores/popupStore";
let popupPinia = usePopupStore();

function closePopup ()
{
  window.close();
}
</script>

<template>
  <div class="flex justify-between items-center">
    <Transition name="fade" mode="out-in">
      <div v-if="!popupPinia.showHeaderIcon()">
        <img class="w-24 h-14 ml-6" src="@/assets/img/icon-popup-header.svg" alt="LeadMe Icon"/>
      </div>

      <span
          v-else
          class="h-14 pt-6 pl-6 text-base font-poppins cursor-pointer"
          v-on:click="popupPinia.back"
      >
        <img src="/src/assets/img/popup-icon-back.svg" alt="back"/>
      </span>
    </Transition>

    <span
        class="mr-6 text-base cursor-pointer"
        v-on:click="closePopup">
      <img src="/src/assets/img/onboarding/close.svg" alt="close"/>
    </span>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
