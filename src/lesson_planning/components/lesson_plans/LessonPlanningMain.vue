<script setup lang="ts">
import {onBeforeMount, ref} from "vue";
import {useLessonPlanningStore} from "../../stores/lessonPlanningStore";
import LessonPlanCard from "./LessonPlanCard.vue";
import Lesson from "../../models/lesson";
import ViewLessonPlan from "./ViewLessonPlan.vue";
import GenericButton from "../../../components/Buttons/GenericButton.vue";
import CreateLessonPlan from "./CreateLessonPlan.vue";
import SelectBookmarks from "./SelectBookmarks.vue";
import EditLessonPlan from "./EditLessonPlan.vue";

let lessonPlanningStore = useLessonPlanningStore()

const lessonBeingViewed = ref<InstanceType<typeof Lesson> | null>(null)

onBeforeMount(() => {
  lessonPlanningStore.loadLessons()
})
</script>
<template>
  <div class="mt-14 mx-10 overflow-y-scroll">
    <div>
      <h1 class="text-2xl font-medium mb-4">Lesson Plans</h1>
      <GenericButton type="primary" :callback="() => { lessonPlanningStore.setView('create-lesson') }">
        <div class="flex flex-row justify-center">
          <img src="../../assets/external_link.svg" alt="icon representing link" class="mr-2"/>
          <span class="font-medium">New lesson plan</span>
        </div>
      </GenericButton>
    </div>
    <div v-if="lessonPlanningStore.view === 'lessons'">
      <div v-if="lessonPlanningStore.lessons?.length" class="flex flex-row flex-wrap -m-4 mt-8">
        <LessonPlanCard
            v-for="lesson in lessonPlanningStore.lessons"
            :id="lesson.id"
            :lesson-plan="lesson"
            @select-lesson="(selectedLesson) => {this.lessonBeingViewed = selectedLesson; lessonPlanningStore.setView('lesson')}"
            class="w-1/2 xl:w-1/4 md:w-1/3 my-4"/>
      </div>
    </div>
    <div class="flex justify-center overflow-hidden">
      <ViewLessonPlan
          v-if="lessonPlanningStore.view === 'lesson'"
          :lesson-plan="lessonBeingViewed"
          @edit-lesson="(selectedLesson) => { this.lessonBeingViewed = selectedLesson; lessonPlanningStore.setView('edit-lesson')}"></ViewLessonPlan>
      <EditLessonPlan
          v-if="lessonPlanningStore.view === 'create-lesson'"
          :lesson-plan="new Lesson('', '', '', '', null, null, [], [], [], [])"
          :submit-callback="(lessonPlan) => {
            return lessonPlanningStore.createLesson(lessonPlan)
          }"
      >
        <template #heading>
          Create new lesson plan
        </template>
      </EditLessonPlan>
      <EditLessonPlan
          v-if="lessonPlanningStore.view === 'edit-lesson'"
          :lesson-plan="lessonBeingViewed"
          :submit-callback="(lessonPlan) => {
            return lessonPlanningStore.updateLesson(lessonPlan.id, lessonPlan)
          }"
      >
        <template #heading>
          Update lesson plan
        </template>
      </EditLessonPlan>
      <SelectBookmarks v-if="lessonPlanningStore.view === 'select-bookmarks'" :lesson="lessonBeingViewed"></SelectBookmarks>
    </div>
  </div>
</template>