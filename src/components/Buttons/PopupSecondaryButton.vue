<script lang="ts">
export default {
  name: "PopupSecondaryButton"
}
</script>

<template>
  <button class="w-64 h-10 rounded-lg text-white bg-blue-500 text-base hover:bg-blue-400">
    <slot/>
  </button>
</template>
