<script setup lang="ts">
import GenericButton from "../../../components/Buttons/GenericButton.vue";
import TagSelection from "../TagSelection.vue";
import {useLessonPlanningStore} from "../../stores/lessonPlanningStore";
import Lesson from "../../models/lesson";
import {onMounted, ref} from "vue";
const { updateLesson } = useLessonPlanningStore()

const props = defineProps({
  lesson: {
    type: Lesson,
    required: true,
  },
});

let localLesson = ref<Lesson>({ ...props.lesson })

onMounted(() => {
  localLesson.value = { ...props.lesson }
})

function update() {
  localLesson.value.lessonParts.forEach(lessonPart => {
    lessonPart.lessonId = localLesson.value.id
  })
  updateLesson(localLesson.value.id, localLesson.value)
}

</script>
<template>
  <div
      class="flex flex-col w-full bg-white rounded-md
      max-w-4xl mt-8 p-12 pb-4">
    <div class="flex flex-col">
      <h2 class="font-medium text-lg">Edit lesson plan</h2>
      <hr />

      <div class="mt-8 bg-white flex flex-col">
        <div class="flex items-center justify-between">
          <input
              class="h-11 px-4 flex-grow bg-panel-background text-base rounded-lg"
              type="text"
              placeholder="Enter a name"
              v-model="localLesson.name"
          />
        </div>
      </div>

      <div class="mt-8 bg-white flex flex-col">
        <div class="flex items-center justify-between">
          <input
              class="h-11 px-4 flex-grow bg-panel-background text-base rounded-lg"
              type="text"
              placeholder="Enter a description"
              v-model="localLesson.description"
          />
        </div>
      </div>

      <div class="mt-8 bg-white flex flex-col">
        <div class="flex items-center justify-between">
          <input
              class="h-11 px-4 flex-grow bg-panel-background text-base rounded-lg"
              type="text"
              placeholder="Enter a year levels"
              v-model="localLesson.yearLevels"
          />
        </div>
      </div>

      <TagSelection class="mt-8" v-model="localLesson.tags" />

      <div class="flex flex-col justify-start">
        <GenericButton :callback="update" type="purple">
          Save
        </GenericButton>
      </div>
    </div>
  </div>
</template>