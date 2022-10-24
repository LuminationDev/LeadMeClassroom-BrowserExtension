<script>
export default {
  props: ['modelValue'],

  methods: {
    handleInput(event) {
      if (event.key === "Backspace" || event.key === "Delete") {
        if(event.target.previousElementSibling) {
          event.target.previousElementSibling.focus();
        }
        return;
      }

      if(/^[a-zA-Z0-9]+$/.test(event.target.value)) {
        if (event.target.nextElementSibling) {
          event.target.nextElementSibling.focus();
        }
        return;
      }
    }
  },
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
    "
    v-on:keyup.prevent="handleInput($event)"
    />
</template>
