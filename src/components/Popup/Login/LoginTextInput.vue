<script setup>
defineProps({
  placeholder: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
});
defineEmits(['update:modelValue'])
</script>

<template>
  <input
    class="w-64 h-12 rounded-lg border-2 px-1 text-sm"
    :type='type'
    :placeholder='placeholder'
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>
