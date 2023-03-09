<script setup lang="ts">
import {computed} from "vue";

const props = defineProps({
  tag: {
    type: Object,
    required: true,
  },
  canDelete: {
    type: Boolean,
    default: false
  },
  theme: {
    type: String,
    default: 'dark'
  }
});

defineEmits<{
  (e: 'delete'): void
}>()
</script>
<template>
  <div class="flex flex-row bg-zinc-800 text-white rounded-md py-1"
      :class="{
        'bg-zinc-800 text-white px-2': theme === 'dark',
        'bg-transparent text-black': theme === 'light'
      }">
    <img v-if="theme === 'dark'" alt="tag icon" src="../assets/tag.svg" class="pr-1" />
    <img v-else-if="theme === 'light'" alt="tag icon" src="../assets/tag_grey.svg" class="pr-1" />
    <span>{{ tag.name }}</span>
    <img v-if="canDelete" @click="$emit('delete')"
         alt="cross icon, click to remove tag"
         src="../assets/cross.svg"
         class="pl-2 cursor-pointer"/>
  </div>
</template>