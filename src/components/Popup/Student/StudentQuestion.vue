<script setup lang="ts">
import GenericButton from "../../Buttons/GenericButton.vue";
</script>

<template>
  <div class="h-full flex flex-col mx-6">
    <div class="text-xsm text-gray-400 text-left font-semibold mt-4 mb-2">Your Question</div>

    <input class="w-full h-11 px-3 mb-2 border-2 border-gray-300 rounded-lg" placeholder="How can I ..."/>

    <GenericButton
        class="flex flex-row justify-center items-center w-full h-9 font-normal text-white bg-blue-500 hover:bg-blue-300"
        :type="'primary'"
        :callback="() => {}"
    >
      <div class="text-sm">Submit Question</div>
    </GenericButton>
  </div>
</template>
