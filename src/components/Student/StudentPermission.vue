<script setup>

</script>

<template>
  <div class="text-left">
    <div class="flex justify-between mb-2">
      <slot name="title"></slot>
      <label for="green-toggle" class="inline-flex relative items-center cursor-pointer">
        <input type="checkbox" value="" id="green-toggle" class="sr-only peer" checked>
        <div
            class="w-11 h-6 bg-gray-200 rounded-full peer
                dark:bg-gray-700
                peer-checked:after:translate-x-full
                peer-checked:after:border-white after:content-['']
                after:absolute
                after:top-0.5
                after:left-[2px]
                after:bg-white
                after:border-gray-300
                after:border
                after:rounded-full
                after:h-5
                after:w-5
                after:transition-all
                dark:border-gray-600
                peer-checked:bg-green-500"></div>
      </label>
    </div>
    <slot name="content"></slot>
  </div>
</template>
