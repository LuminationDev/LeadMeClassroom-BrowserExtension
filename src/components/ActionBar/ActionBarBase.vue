<script setup lang="ts">
</script>

<template>
  <div class="h-10 flex justify-evenly items-center bg-blue-500 rounded-3xl">
    <!--Left hand side of the action bar-->
    <div>
      <slot name="left"/>
    </div>

    <!--Right hand side of the action bar-->
    <div>
      <slot name="right"/>
    </div>
  </div>
</template>