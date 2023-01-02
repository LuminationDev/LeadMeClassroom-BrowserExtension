<script setup lang="ts">
const props = defineProps({
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
const emit = defineEmits(['update:modelValue'])

function handleInput(inputEvent: InputEvent) {
  // @ts-ignore
  emit('update:modelValue', inputEvent?.target?.value)
  props.v$.$commit()
  if (!props.v$.$invalid && props.v$.$dirty) {
    props.v$.$touch()
  }
}

</script>

<template>
  <div>
    <input
        v-if="v$"
        class="w-64 h-12 rounded-lg border-2 px-3 text-sm"
        :class="v$.$error ? 'border-red-800 focus:border-red-900' : ''"
        type='email'
        :placeholder='placeholder'
        :value="modelValue"
        @input="handleInput"
        @focusout="() => { v$.$touch() }"
    />
    <div class="flex flex-col items-start" v-if="v$ && v$.$error">
      <div class="text-red-800" v-for="error in v$.$errors">{{ error.$message }}</div>
    </div>
  </div>
</template>
