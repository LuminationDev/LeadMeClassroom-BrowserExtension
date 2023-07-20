<script setup lang="ts">
defineProps({
  colour: {
    type: String,
    required: false,
    default: '#fffff'
  }
});
</script>

<template>
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 26.6668L5.73333 21.4668C2.63467 16.8841 3.832 10.9708 8.53333 7.63478C13.2347 4.30012 19.9867 4.57345 24.3267 8.27478C28.6667 11.9775 29.2533 17.9628 25.6987 22.2761C22.144 26.5895 15.5453 27.8961 10.2667 25.3335L4 26.6668Z" :stroke="colour" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15.6001 20.5332V20.5465" :stroke="colour" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15.6001 16.5332C16.1998 16.535 16.7825 16.3346 17.2543 15.9645C17.7261 15.5943 18.0593 15.0759 18.2002 14.493C18.341 13.9101 18.2813 13.2967 18.0307 12.752C17.78 12.2072 17.3531 11.7628 16.8188 11.4905C16.2883 11.2188 15.6816 11.1346 15.0972 11.2515C14.5128 11.3684 13.9851 11.6797 13.6001 12.1345" :stroke="colour" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>
