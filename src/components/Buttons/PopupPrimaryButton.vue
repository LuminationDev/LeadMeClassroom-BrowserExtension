<script lang="ts">
export default {
  name: "PopupPrimaryButton"
}
</script>

<template>
  <button class="w-64 h-12 bg-blue-500 rounded-lg text-white text-base mb-3 hover:bg-blue-400">
    <slot/>
  </button>
</template>
