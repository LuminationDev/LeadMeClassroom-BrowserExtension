<script setup lang="ts">
import Tag from "../Tag.vue";
import LessonPartListItem from "./LessonPartListItem.vue";
import { formatTimeFromMinutes } from "../../utils/formatters";
import GenericButton from "../../../components/Buttons/GenericButton.vue";
import {useLessonPlanningStore} from "../../stores/lessonPlanningStore";
import CreateLessonPart from "./CreateLessonPart.vue";

let lessonPlanningStore = useLessonPlanningStore()

</script>
<template>
  <div
      class="flex flex-col w-full bg-white rounded-md
      max-w-4xl mt-8 p-12 pb-4 border-b-[20px] border-b-purple-500
      border-b-solid overflow-hidden">
    <div class="flex flex-row justify-between">
      <div class="flex flex-col">
        <span class="uppercase text-neutral-400">Lesson Plan</span>
        <h2 class="text-lg font-medium my-1">{{ lessonPlanningStore.lessonBeingViewed.name }}</h2>
        <span>{{ lessonPlanningStore.lessonBeingViewed.description }}</span>
        <div class="flex flex-row my-3">
          <img alt="clock icon" src="../../assets/stopwatch.svg" class="mr-1" /><span>{{ formatTimeFromMinutes(lessonPlanningStore.lessonBeingViewed.time) }}</span>
        </div>
        <div class="flex flex-row">
          <Tag v-for="tag in lessonPlanningStore.lessonBeingViewed.tags" :id="tag.id" :tag="tag" />
        </div>
      </div>
      <div class="flex flex-col justify-start">
        <GenericButton :callback="() => { lessonPlanningStore.deleteLesson(lessonPlanningStore.lessonBeingViewed.id) }" type="purple">
          Delete
        </GenericButton>
        <router-link :to="{
          name: 'edit-lesson',
          params: {
            id: lessonPlanningStore.lessonBeingViewed.id
          }
        }">
          <GenericButton :callback="() => { }" type="purple">
            Edit
          </GenericButton>
        </router-link>
      </div>
    </div>
    <hr class="my-4"/>
    <h3 class="text-lg font-medium">Insert bookmarks</h3>
    <div v-if="lessonPlanningStore.lessonBeingViewed.lessonParts.length" class="-mb-4 overflow-scroll gray-scrollbar">
      <LessonPartListItem
          class="my-4"
          v-for="lessonPart in lessonPlanningStore.lessonBeingViewed.lessonParts"
          :id="lessonPart.id"
          :lesson-part="lessonPart" />
    </div>
    <div v-else class="relative">
      <div class="absolute text-xl bg-slate-300 bg-opacity-80 z-10 w-full h-full rounded-xl">
        <div class="flex flex-row my-4 justify-center items-center h-full">
          <CreateLessonPart :lesson="lessonPlanningStore.lessonBeingViewed">
            <template #button>
              <GenericButton :callback="() => {}" type="outline-dark" class="mr-2">
                Add new from URL
              </GenericButton>
            </template>
          </CreateLessonPart>
          <router-link :to="{
          name: 'select-bookmarks',
          params: {
            id: lessonPlanningStore.lessonBeingViewed.id
          }
        }">
            <GenericButton :callback="() => { }" type="dark" class="ml-2">
              Add new from library
            </GenericButton>
          </router-link>
        </div>
      </div>
      <LessonPartListItem :lesson-part="{
        imageUrl: '../',
        action: 'https://example.com',
        actionType: 'link',
        name: 'Bookmark Title',
        description: 'Bookmark description',
        timeAllocation: 10
      }"/>
    </div>
    <div class="flex flex-row my-4">
      <CreateLessonPart :lesson="lessonPlanningStore.lessonBeingViewed" />
      <router-link :to="{
          name: 'select-bookmarks',
          params: {
            id: lessonPlanningStore.lessonBeingViewed.id
          }
        }">
        <GenericButton :callback="() => { }" type="dark">
          Add new from library
        </GenericButton>
      </router-link>
    </div>
  </div>
</template>