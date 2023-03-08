<script setup lang="ts">
import Tag from "../Tag.vue";
import Bookmark from "../../models/bookmark";

defineEmits<{
  (e: 'selectBookmark', bookmark: Bookmark): void
}>()

defineProps({
  bookmark: {
    type: Bookmark,
    required: true,
  },
});
</script>
<template>
  <div class="flex flex-col w-full h-full" @click="$emit('selectBookmark', bookmark)">
    <div class="mx-4 bg-white rounded-md">
      <img class="w-full h-40 object-cover rounded-t-md" alt="header image for lesson" :src="bookmark.imageUrl" />
      <div class="p-4">
        <h3 class="text-lg line-clamp-2 font-medium">{{ bookmark.name }}</h3>
        <p class="line-clamp-2">{{ bookmark.description }}</p>
        <div class="flex flex-row mt-8">
          <Tag v-for="tag in bookmark.tags" :id="tag.id" :tag="tag" />
        </div>
      </div>
      <div class="flex flex-row justify-end bg-slate-800 h-8">
        <button class="mr-2 h-full w-auto">
          <img alt="link icon, for visiting bookmark" src="../../assets/external_link.svg" />
        </button>
        <button class="h-full w-auto mr-2">
          <img alt="heart icon, to add lesson to favourites" src="../../assets/heart.svg" />
        </button>
      </div>
    </div>
  </div>
</template>

<style>
</style>