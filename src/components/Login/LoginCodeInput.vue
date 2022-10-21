<script>
export default {
  props: ['modelValue']
};
</script>

<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    type="text"
    maxlength="1"
    class="
      w-11 h-16 text-center
      font-bold text-4xl rounded-lg
      border-black-form-border border-2
    "/>
</template>
