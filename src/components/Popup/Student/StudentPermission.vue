<script setup lang="ts">
defineProps({
  checkedProp: {
    type: Boolean,
    required: true,
  },

  tag: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="text-left">
    <div class="flex justify-between mb-2">
      <slot name="title"></slot>
    </div>
    <slot name="content"></slot>
  </div>
</template>
