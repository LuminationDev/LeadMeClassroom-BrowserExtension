<script setup lang="ts">
import {useLessonPlanningStore} from "../../stores/lessonPlanningStore";
import LessonPlanCard from "./LessonPlanCard.vue";
import {onBeforeMount} from "vue";
import LessonPlanningBase from "./LessonPlanningBase.vue";

let lessonPlanningStore = useLessonPlanningStore()

onBeforeMount(() => {
  lessonPlanningStore.loadLessons()
})
</script>

<template>
  <LessonPlanningBase>
    <div
        v-if="lessonPlanningStore.lessons?.length"
        class="flex flex-row flex-wrap -m-4 mt-8">
      <router-link
          v-for="lesson in lessonPlanningStore.lessons"
          :id="lesson.id"
          :to="`lesson/${lesson.id}/view`"
          class="w-1/2 xl:w-1/4 md:w-1/3 my-4">
        <LessonPlanCard
            :lesson-plan="lesson"
            @select-lesson="(selectedLesson) => {this.lessonPlanningStore.lessonBeingViewed = selectedLesson;}"
        />
      </router-link>
    </div>
  </LessonPlanningBase>
</template>