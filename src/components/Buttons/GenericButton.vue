<script setup lang="ts">
import Spinner from "./Spinner.vue";
import {ref} from "vue";

const props = defineProps({
  type: {
    type: String,
    required: false
  },
  spinnerColor: {
    type: String,
    required: false
  },
  callback: {
    type: Function,
    required: true
  }
});

const spinner = ref(false);

const onClick = async () => {
  spinner.value = true;
  asyncCall().then(() => { spinner.value = false; });
}

const asyncCall = () => {
  return new Promise(async (resolve) => {
    resolve(props.callback());
  }).then();
}
</script>

<template>
  <button
    :class="{
      'bg-blue-500 font-semibold rounded-lg text-white text-base': true,
      'w-64 h-12 mb-3 hover:bg-blue-400': type === 'primary',
      'w-64 h-10 hover:bg-blue-400': type === 'secondary',
    }"
    @click="onClick"
  >
    <Spinner v-if="spinner" :color="spinnerColor"/>
    <slot v-else/>
  </button>
</template>
