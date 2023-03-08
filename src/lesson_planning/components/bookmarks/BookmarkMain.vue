<script setup lang="ts">
import {onBeforeMount, ref} from "vue";
import {useLessonPlanningStore} from "../../stores/lessonPlanningStore";
import LessonPlanCard from "./LessonPlanCard.vue";
import ViewLessonPlan from "./ViewLessonPlan.vue";
import GenericButton from "../../../components/Buttons/GenericButton.vue";
import Bookmark from "../../models/bookmark";
import BookmarkCard from "./BookmarkCard.vue";
import AddBookmark from "./AddBookmark.vue";

let lessonPlanningStore = useLessonPlanningStore()

onBeforeMount(() => {
  lessonPlanningStore.loadBookmarks()
})
</script>
<template>
  <div class="mt-14 mx-10 overflow-y-scroll">
    <div>
      <h1 class="text-2xl font-medium mb-4">Bookmarks</h1>
      <AddBookmark />
    </div>
    <div v-if="lessonPlanningStore.bookmarks?.length" class="flex flex-row flex-wrap -m-4 mt-8">
      <BookmarkCard
          v-for="bookmark in lessonPlanningStore.bookmarks"
          :id="bookmark.id"
          :bookmark="bookmark"
          @select-bookmark="(selectedBookmark) => {}"
          class="w-1/2 xl:w-1/4 md:w-1/3 my-4"/>
    </div>
  </div>
</template>