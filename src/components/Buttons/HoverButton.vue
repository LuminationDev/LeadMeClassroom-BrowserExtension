<script setup lang="ts">
import { ref } from "vue";
const hover = ref(false);
</script>

<template>
  <button @mouseenter="hover = true" @mouseleave="hover = false">
    <slot v-if="hover" name="hover"></slot>
    <slot v-else name="original"></slot>
  </button>
</template>
