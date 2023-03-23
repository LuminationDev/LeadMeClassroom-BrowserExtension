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
      'w-64 h-10 mb-3 hover:bg-blue-400': type === 'primary',
      'w-64 h-10 mb-3 hover:bg-slate-600 bg-slate-800 border-2 border-slate-800': type === 'dark',
      'w-64 h-10 mb-3 bg-white text-slate-800 hover:bg-slate-200 border-2 border-slate-800': type === 'outline-dark',
      'w-64 h-10 hover:bg-blue-400': type === 'secondary',
      'w-40 h-10 hover:bg-violet-700 bg-violet-500': type === 'purple'
    }"
    @click="onClick"
  >
    <Spinner v-if="spinner" :color="spinnerColor"/>
    <slot v-else/>
  </button>
</template>
