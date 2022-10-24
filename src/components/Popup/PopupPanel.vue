<script setup>
import { usePopupStore } from "@/stores/popupStore.ts";
let popupPinia = usePopupStore();
</script>

<template>
  <main class="bg-panel-background pt-9 text-center font-poppins w-panel-width">
    <div
        :class="{
          'px-12': true,
          'px-6': popupPinia.view === 'permissions',
        }"
    >
      <div class="text-base font-bold text-black-form-border">
        <slot name="header"></slot>
      </div>

      <slot name="content"></slot>
    </div>

    <slot name="footer"></slot>
  </main>
</template>
