<script setup lang="ts">
import Tag from "../Tag.vue";
import Bookmark from "../../models/bookmark";
import EditBookmark from "./EditBookmark.vue";
import {useLessonPlanningStore} from "../../stores/lessonPlanningStore";

let lessonPlanningStore = useLessonPlanningStore()

defineEmits<{
  (e: 'selectBookmark', bookmark: Bookmark): void
  (e: 'update:modelValue', checked: boolean, id: string): void
}>()

defineProps({
  bookmark: {
    type: Bookmark,
    required: true,
  },
  hasCheckbox: {
    type: Boolean,
    required: false,
    default: false
  },
  modelValue: {
    type: Array,
    required: false
  }
});
</script>
<template>
  <div class="flex flex-col w-full h-full" @click="$emit('selectBookmark', bookmark)">
    <input
        v-if="hasCheckbox"
        type="checkbox"
        :checked="modelValue.includes(bookmark.id)"
        @change="(event) => { $emit('update:modelValue', event.target.checked, bookmark.id) }">
    <div class="mx-4 bg-white rounded-md">
      <img class="w-full h-40 object-cover rounded-t-md" alt="header image for lesson" :src="bookmark.imageUrl" />
      <div class="px-4 mt-4 text-neutral-400">{{ new Date(bookmark.created_at).toLocaleDateString('en-AU', { month: 'long', day: 'numeric' }) }}</div>
      <div class="p-4">
        <h3 class="text-lg line-clamp-2 font-medium">{{ bookmark.name }}</h3>
        <p class="line-clamp-2">{{ bookmark.action }}</p>
        <div class="flex flex-col mt-8">
          <Tag v-for="tag in bookmark.tags" :id="tag.id" :tag="tag" theme="light" />
        </div>
      </div>
      <div class="flex flex-row justify-end items-center bg-slate-800 h-8">
        <a :href="bookmark.action" target="_blank" class="mr-2 h-full w-auto">
          <img alt="link icon, for visiting bookmark" src="../../assets/external_link.svg" />
        </a>
        <button @click="() => {
          lessonPlanningStore.deleteBookmark(bookmark.id)
        }" class="h-full w-auto mr-2">
          <img alt="cross icon, to delete bookmark" src="../../assets/cross.svg" />
        </button>
        <button class="h-full w-auto mr-2">
          <img alt="heart icon, to add lesson to favourites" src="../../assets/heart.svg" />
        </button>
        <EditBookmark
            :bookmark="bookmark"
            :submit-callback="(updatedBookmark) => {
               return lessonPlanningStore.updateBookmark(updatedBookmark.id, updatedBookmark)
            }">
          <template #button>
            Edit Bookmark
          </template>
          <template #heading>
            Edit Bookmark
          </template>
          <template #submitButton>
            Save
          </template>
        </EditBookmark>
      </div>
    </div>
  </div>
</template>

<style>
</style>