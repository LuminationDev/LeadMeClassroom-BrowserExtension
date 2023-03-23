<script setup lang="ts">
defineProps({
  placeholder: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text'
  },
  modelValue: {
    type: String,
    required: true
  },
  v$: {
    type: Object,
    required: true
  }
});
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-col w-full">
    <label :for="id" class="uppercase pl-2">{{ label }}</label>
    <input
        :id="id"
        v-if="v$"
        class="w-full h-12 rounded-lg border-2 px-3 text-sm"
        :class="v$.$error ? 'border-red-800 focus:border-red-900' : ''"
        :type='type'
        :placeholder='placeholder'
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
    />
    <div class="flex flex-col items-start" v-if="v$ && v$.$error">
      <div class="text-red-800" v-for="error in v$.$errors">{{ error.$message }}</div>
    </div>
  </div>
</template>
