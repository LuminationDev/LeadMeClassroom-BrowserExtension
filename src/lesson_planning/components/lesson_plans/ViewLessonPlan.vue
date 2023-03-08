<script setup lang="ts">
import Tag from "../Tag.vue";
import Lesson from "../../models/lesson";
import LessonPartListItem from "./LessonPartListItem.vue";
import { formatTimeFromMinutes } from "../../utils/formatters";
import GenericButton from "../../../components/Buttons/GenericButton.vue";

defineProps({
  lessonPlan: {
    type: Lesson,
    required: true,
  },
});
</script>
<template>
  <div
      class="flex flex-col w-full bg-white rounded-md
      max-w-4xl mt-8 p-12 pb-4 border-b-[20px] border-b-purple-500
      border-b-solid overflow-hidden">
    <div class="flex flex-row justify-between">
      <div class="flex flex-col">
        <span class="uppercase text-neutral-400">Lesson Plan</span>
        <h2 class="text-lg font-medium my-1">{{ lessonPlan.name }}</h2>
        <span>{{ lessonPlan.description }}</span>
        <div class="flex flex-row my-3">
          <img alt="clock icon" src="../../assets/stopwatch.svg" class="mr-1" /><span>{{ formatTimeFromMinutes(lessonPlan.time) }}</span>
        </div>
        <div class="flex flex-row">
          <Tag v-for="tag in lessonPlan.tags" :id="tag.id" :tag="tag" />
        </div>
      </div>
      <div class="flex flex-col justify-start">
        <GenericButton :callback="() => {}" type="purple">
          Start
        </GenericButton>
      </div>
    </div>
    <hr class="my-4"/>
    <div class="-my-4 overflow-scroll gray-scrollbar">
      <LessonPartListItem
          class="my-4"
          v-for="lessonPart in lessonPlan.lessonParts"
          :id="lessonPart.id"
          :lesson-part="lessonPart" />
    </div>
    <div class="flex flex-row my-4">
      <GenericButton :callback="() => {}" type="outline-dark" class="mr-2">
        Add new from URL
      </GenericButton>
      <GenericButton :callback="() => {}" type="dark">
        Add new from library
      </GenericButton>
    </div>
  </div>
</template>