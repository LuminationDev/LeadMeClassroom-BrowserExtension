<script setup lang="ts">
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
  },
  v$: {
    type: Object,
    required: true
  }
});
defineEmits(['update:modelValue'])
</script>

<template>
  <div>
    <input
        v-if="v$"
        class="w-64 h-12 rounded-lg border-2 px-3 text-sm"
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
