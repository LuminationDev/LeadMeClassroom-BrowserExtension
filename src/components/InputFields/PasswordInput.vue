<script setup lang="ts">
import {ref} from "vue";

defineProps({
  placeholder: {
    type: String,
    required: true,
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

const showPassword = ref(false)
</script>

<template>
  <div>
    <div class="flex flex-row">
      <input
          v-if="v$"
          class="w-52 h-12 rounded-bl-lg rounded-tl-lg border-2 px-3 text-sm"
          :class="v$.$error ? 'border-red-800 focus:border-red-900' : 'border-r-white border-l-gray-200 border-b-gray-200 border-t-gray-200'"
          :type="showPassword ? 'text' : 'password'"
          :placeholder='placeholder'
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
      />
      <button
          class="w-12 h-12 rounded-br-lg rounded-tr-lg bg-white
            border-2 border-r-px border-r-gray-200 border-b-gray-200
            border-t-gray-200"
          @click="showPassword = !showPassword">
        <span class="flex justify-center">
          <img v-if="showPassword" class="w-6 h-5" src="@/assets/icons/eye_icon.svg" alt="Icon"/>
          <img v-else class="w-6 h-5" src="@/assets/icons/eye_slash_icon.svg" alt="Icon"/>
        </span>
      </button>
    </div>

    <div class="flex flex-col items-start" v-if="v$ && v$.$error">
      <div class="text-red-800" v-for="error in v$.$errors">{{ error.$message }}</div>
    </div>
  </div>
</template>
