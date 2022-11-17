<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="h-12 w-64 mb-4 bg-white flex place-items-center rounded-md cursor-pointer hover:bg-gray-200">
    <div class="ml-6 text-base">
      <p>{{ title }}</p>
    </div>

    <div class="mr-5 flex flex-grow justify-end">
      <img class="w-7 h-7"
           src="@/assets/img/settings-icon-arrow.svg"
           alt="Settings arrow"
      />
    </div>
  </div>
</template>
