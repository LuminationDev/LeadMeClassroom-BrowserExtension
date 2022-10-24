<script setup>
defineProps({
  placeholder: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <input
    :class="{
      'w-64 h-12 rounded-lg border-2 px-1 text-sm': true,
      'border-black-form-border': 'focused',
      'border-gray-separator': '!focused',
      }"
    @focus="'focused = true'"
    type="text"
    :placeholder='placeholder'
    @input="$emit('update', $event.target.value)"
  />
</template>
