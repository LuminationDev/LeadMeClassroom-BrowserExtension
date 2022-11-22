<script setup lang="ts">
import AccountGridItem from "./AccountGridItem.vue";
</script>

<template>
  <div>
    <AccountGridItem :title="'Reset password'"/>
    <AccountGridItem :title="'Change name'"/>
    <AccountGridItem :title="'Other setting'"/>
  </div>
</template>
