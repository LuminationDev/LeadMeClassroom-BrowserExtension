<script setup lang="ts">
defineProps({
  tag: {
    type: Object,
    required: true,
  },
  canDelete: {
    type: Boolean,
    default: true
  }
});

defineEmits<{
  (e: 'delete'): void
}>()
</script>
<template>
  <div class="flex flex-row bg-zinc-800 text-white rounded-md px-2 py-1">
    <img alt="tag icon" src="../assets/tag.svg" class="pr-1" />
    <span>{{ tag.name }}</span>
    <img v-if="canDelete" @click="$emit('delete')"
         alt="cross icon, click to remove tag"
         src="../assets/cross.svg"
         class="pl-2 cursor-pointer"/>
  </div>
</template>