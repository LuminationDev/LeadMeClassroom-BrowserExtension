<script setup lang="ts">
import StudentHeader from "./Student/StudentHeader.vue";

defineProps({
  showHeader: {
    type: Boolean,
    require: false,
    default: false
  }
})
</script>

<template>
  <main class="flex flex-col h-96 w-80 bg-panel-background pt-4 text-center font-poppins">
    <StudentHeader v-if="showHeader"/>
    <slot></slot>
  </main>
</template>
