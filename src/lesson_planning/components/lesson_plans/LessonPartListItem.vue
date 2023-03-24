<script setup lang="ts">
import LessonPart from "../../models/lessonPart";
import { formatTimeAsDigitalFromMinutes } from "../../utils/formatters";
import {useLessonPlanningStore} from "../../stores/lessonPlanningStore";
import EditLessonPart from "./EditLessonPart.vue";

let lessonPlanningStore = useLessonPlanningStore()

defineProps({
  lessonPart: {
    type: LessonPart,
    required: true,
  },
});
</script>
<template>
  <div class="flex flex-col bg-slate-50 rounded-md h-fit">
    <div class="p-4 flex flex-row">
      <img :src="lessonPart.imageUrl" class="w-52" />
      <div class="flex flex-col ml-4">
        <h3 class="text-lg line-clamp-2 font-medium">{{ lessonPart.name }}</h3>
        <a :href="lessonPart.action" class="text-neutral-700 text-xsm">{{ lessonPart.action }}</a>
        <h4 class="uppercase text-neutral-400 mt-8">Notes</h4>
        <p class="line-clamp-2 mt-1">{{ lessonPart.description }}</p>
      </div>
    </div>
    <div class="relative">
      <div class="absolute top-8 right-5 flex flex-row">
        <EditLessonPart :lesson-part="lessonPart" />
        <button @click="() => {
          lessonPlanningStore.deleteLessonPart(lessonPart.id)
        }" class="h-full w-auto mx-2 hover:bg-slate-200 rounded-md">
          <img alt="pencil icon, to edit lesson part" src="../../assets/bin.svg" />
        </button>
      </div>
      <div class="absolute right-5 bottom-5 bg-zinc-800 text-white flex flex-row px-2 py-1 rounded-md">
        <img alt="clock icon" src="../../assets/stopwatch_white.svg" class="mr-1" /><span>{{ formatTimeAsDigitalFromMinutes(lessonPart.timeAllocation) }}</span>
      </div>
    </div>
  </div>
</template>