<script setup lang="ts">
import {onBeforeMount, ref} from "vue";
import {useLessonPlanningStore} from "../../stores/lessonPlanningStore";
import LessonPlanCard from "./LessonPlanCard.vue";
import ViewLessonPlan from "./ViewLessonPlan.vue";
import GenericButton from "../../../components/Buttons/GenericButton.vue";
import Bookmark from "../../models/bookmark";
import BookmarkCard from "./BookmarkCard.vue";
import AddBookmark from "./AddBookmark.vue";
import {useDebounce} from "../../composables/debounce";
import EditBookmark from "./EditBookmark.vue";

const { debounce } = useDebounce()

let lessonPlanningStore = useLessonPlanningStore()

onBeforeMount(() => {
  lessonPlanningStore.loadBookmarks(bookmarksQuery.value)
})

const bookmarksQuery = ref({
  search: '',
  page: 1
})

function searchBookmarks() {
  return lessonPlanningStore.loadBookmarks(bookmarksQuery.value)
}

function debounceSearch() {
  return debounce(() => {
    searchBookmarks()
  }, 200)
}
</script>
<template>
  <div class="mt-14 mx-10 overflow-y-scroll">
    <div class="flex flex-row justify-between">
      <div>
        <h1 class="text-2xl font-medium mb-4">Bookmarks</h1>
        <EditBookmark
            :bookmark="new Bookmark('', '', '', '', '', 'link', null, null, [], [], [], [])"
            :submit-callback="(newBookmark) => { return lessonPlanningStore.createBookmark(newBookmark) }"
        >
          <template #button>
            New Bookmark
          </template>
          <template #heading>
            New Bookmark
          </template>
          <template #submitButton>
            Add to library
          </template>
        </EditBookmark>
      </div>
      <div>
        <input placeholder="Search"
               v-model="bookmarksQuery.search"
               @input="(event) => {debounceSearch(event.target.value)}"/>
      </div>
    </div>
    <div v-if="lessonPlanningStore.bookmarks?.length" class="flex flex-row flex-wrap -m-4 mt-8">
      <BookmarkCard
          v-for="bookmark in lessonPlanningStore.bookmarks"
          :id="bookmark.id"
          :bookmark="bookmark"
          @select-bookmark="(selectedBookmark) => {}"
          class="w-1/2 xl:w-1/4 md:w-1/3 my-4"/>
    </div>

    <div v-if="lessonPlanningStore.bookmarksPagination">
      <button v-if="lessonPlanningStore.bookmarksPagination?.currentPage > 1"
        @click="() => {
            bookmarksQuery.page--
            debounceSearch()
        }">
        {{ lessonPlanningStore.bookmarksPagination?.currentPage - 1 }}
      </button>
      <button
        @click="() => {
          debounceSearch()
        }">
        {{ lessonPlanningStore.bookmarksPagination?.currentPage }}
      </button>
      <button v-if="lessonPlanningStore.bookmarksPagination?.totalPages > 1 && lessonPlanningStore.bookmarksPagination?.currentPage < lessonPlanningStore.bookmarksPagination?.totalPages"
        @click="() => {
            bookmarksQuery.page++
            debounceSearch()
        }">
        {{ lessonPlanningStore.bookmarksPagination?.currentPage + 1 }}
      </button>
    </div>
  </div>
</template>