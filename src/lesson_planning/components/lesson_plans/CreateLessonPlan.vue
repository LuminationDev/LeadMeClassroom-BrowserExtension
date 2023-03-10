<script setup lang="ts">
import GenericButton from "../../../components/Buttons/GenericButton.vue";
import {ref} from "vue";
import TagSelection from "../TagSelection.vue";
import {useLessonPlanningStore} from "../../stores/lessonPlanningStore";
const { createLesson } = useLessonPlanningStore()

const lessonPlan = ref({
  name: '',
  description: '',
  yearLevels: '',
  tags: []
})
</script>
<template>
  <div
      class="flex flex-col w-full bg-white rounded-md
      max-w-4xl mt-8 p-12 pb-4">
    <div class="flex flex-col">
      <h2 class="font-medium text-lg">Create new lesson plan</h2>
      <hr />

      <div class="mt-8 bg-white flex flex-col">
        <div class="flex items-center justify-between">
          <input
              class="h-11 px-4 flex-grow bg-panel-background text-base rounded-lg"
              type="text"
              placeholder="Enter a name"
              v-model="lessonPlan.name"
          />
        </div>
      </div>

      <div class="mt-8 bg-white flex flex-col">
        <div class="flex items-center justify-between">
          <input
              class="h-11 px-4 flex-grow bg-panel-background text-base rounded-lg"
              type="text"
              placeholder="Enter a description"
              v-model="lessonPlan.description"
          />
        </div>
      </div>

      <div class="mt-8 bg-white flex flex-col">
        <div class="flex items-center justify-between">
          <input
              class="h-11 px-4 flex-grow bg-panel-background text-base rounded-lg"
              type="text"
              placeholder="Enter a year levels"
              v-model="lessonPlan.yearLevels"
          />
        </div>
      </div>

      <TagSelection class="mt-8" v-model="lessonPlan.tags" />

      <div class="flex flex-col justify-start">
        <GenericButton :callback="() => { createLesson(lessonPlan) }" type="purple">
          Save
        </GenericButton>
      </div>
    </div>
  </div>
</template>