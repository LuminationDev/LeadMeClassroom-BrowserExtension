<script setup lang="ts">
import GenericButton from "../../../components/Buttons/GenericButton.vue";
import {reactive} from "vue";
import TagSelection from "../TagSelection.vue";
import {required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import Lesson from "../../models/lesson";
import {useLessonPlanningStore} from "../../stores/lessonPlanningStore";
import {useRoute} from "vue-router";

let lessonPlanningStore = useLessonPlanningStore()

const localLessonPlan = reactive<Lesson>({ ...lessonPlanningStore.lessonBeingViewed })

const route = useRoute()

const rules = {
  name: {
    required
  },
  description: {
    required
  },
  yearLevels: {
    required
  },
  tags: {}
}

const v$ = useVuelidate(rules,
    localLessonPlan
)

async function validateAndSubmit() {
  const result = await v$.value.$validate();
  if (!result) { return; }

  submit();
}

const values = (): { heading: string, submit: Function } => {
  switch (route.params.name) {
    case 'edit-lesson':
      return {
        heading: 'Edit lesson',
        submit: (lessonPlan: Lesson) => {
          lessonPlanningStore.updateLesson(lessonPlan.id, lessonPlan)
        }
      }
    case 'create-lesson':
      return {
        heading: 'Create lesson',
        submit: (lessonPlan: Lesson) => {
          lessonPlanningStore.createLesson(lessonPlan)
        }
      }
  }
  return {
    heading: 'Save lesson',
    submit: () => {}
  }
}

function submit()
{
  localLessonPlan.lessonParts.forEach(lessonPart => lessonPart.lessonId = localLessonPlan.id)
  values().submit(localLessonPlan)
}

</script>
<template>
  <div
      class="flex flex-col w-full bg-white rounded-md
      max-w-4xl mt-8 p-12 pb-4">
    <div class="flex flex-col">
      <h2 class="font-medium text-lg">
        {{ values().heading }}
      </h2>
      <hr />

      <div class="mt-8 bg-white flex flex-col">
        <div class="flex items-center justify-between">
          <input
              class="h-11 px-4 flex-grow bg-panel-background text-base rounded-lg"
              type="text"
              placeholder="Enter a name"
              v-model="v$.name.$model"
          />
        </div>
      </div>

      <div class="mt-8 bg-white flex flex-col">
        <div class="flex items-center justify-between">
          <input
              class="h-11 px-4 flex-grow bg-panel-background text-base rounded-lg"
              type="text"
              placeholder="Enter a description"
              v-model="v$.description.$model"
          />
        </div>
      </div>

      <div class="mt-8 bg-white flex flex-col">
        <div class="flex items-center justify-between">
          <input
              class="h-11 px-4 flex-grow bg-panel-background text-base rounded-lg"
              type="text"
              placeholder="Enter a year levels"
              v-model="v$.yearLevels.$model"
          />
        </div>
      </div>

      <TagSelection class="mt-8" v-model="v$.tags.$model" />

      <div class="flex flex-col justify-start">
        <GenericButton :callback="validateAndSubmit" type="purple">
          Save
        </GenericButton>
      </div>
    </div>
  </div>
</template>