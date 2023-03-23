<script setup lang="ts">
import Tag from "../Tag.vue";
import Lesson from "../../models/lesson";
import { formatTimeFromMinutes } from "../../utils/formatters";
import {computed} from "vue";

defineEmits<{
  (e: 'selectLesson', lessonPlan: Lesson): void
}>()

const props = defineProps({
  lessonPlan: {
    type: Lesson,
    required: true,
  },
});
let imageSrc = computed(() => {
  if (props.lessonPlan && props.lessonPlan.lessonParts[0]) {
    return props.lessonPlan.lessonParts[0].imageUrl
  }
  return '../../assets/generic_image.png'
})
</script>
<template>
  <div class="flex flex-col w-full h-full" @click="$emit('selectLesson', lessonPlan)">
    <div class="mx-4 bg-white rounded-md">
      <img class="w-full h-40 object-cover rounded-t-md"
           alt="header image for lesson"
           :src="imageSrc" />
      <div class="p-4">
        <h3 class="text-lg line-clamp-2 font-medium">{{ lessonPlan.name }}</h3>
        <p class="line-clamp-2">{{ lessonPlan.description }}</p>
        <div class="flex flex-row my-2" v-if="lessonPlan.time">
          <img alt="clock icon" src="../../assets/stopwatch.svg" />
          <span class="ml-1">{{ formatTimeFromMinutes(lessonPlan.time) }}</span>
        </div>
        <div class="flex flex-row mt-8">
          <Tag v-for="tag in lessonPlan.tags" :id="tag.id" :tag="tag" />
        </div>
      </div>
      <div class="flex flex-row justify-end bg-purple-500 h-8 rounded-b-md">
        <button class="mr-2 h-full w-auto">
          <img alt="play icon, for starting lesson" src="../../assets/play.svg" />
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