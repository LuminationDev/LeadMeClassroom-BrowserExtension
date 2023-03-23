<script setup lang="ts">
import GenericButton from "../../../components/Buttons/GenericButton.vue";
import {computed, reactive} from "vue";
import TagSelection from "../TagSelection.vue";
import {required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import Lesson from "../../models/lesson";
import {useLessonPlanningStore} from "../../stores/lessonPlanningStore";
import {useRoute} from "vue-router";
import LessonPlanningBase from "./LessonPlanningBase.vue";
import TextInput from "../TextInput.vue";
import YearLevelInput from "../YearLevelInput.vue";

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

const values = computed((): { heading: string, submit: Function } => {
  switch (route.name) {
    case 'edit-lesson':
      return {
        heading: 'Edit lesson',
        submit: (lessonPlan: Lesson) => {
          lessonPlanningStore.updateLesson(lessonPlan.id, lessonPlan)
        }
      }
    case 'create-lesson':
      return {
        heading: 'Create a new lesson plan',
        submit: (lessonPlan: Lesson) => {
          lessonPlanningStore.createLesson(lessonPlan)
        }
      }
  }
  return {
    heading: 'Save lesson',
    submit: () => {}
  }
})

function submit()
{
  if (localLessonPlan.lessonParts && localLessonPlan.lessonParts.length) {
    localLessonPlan.lessonParts.forEach(lessonPart => lessonPart.lessonId = localLessonPlan.id)
  }
  values.value.submit(localLessonPlan)
}

</script>
<template>
  <LessonPlanningBase>
    <div class="flex justify-center w-full">
      <div
          class="flex flex-col w-full bg-white rounded-md
      max-w-4xl mt-8 p-12 pb-4">
        <div class="flex flex-col">
          <h2 class="font-medium text-lg">
            {{ values.heading }}
          </h2>
          <hr />

          <TextInput
              :v$="v$.name"
              v-model="v$.name.$model"
              label="Lesson Plan Title"
              class="my-8"
              id="name"
              placeholder="E.g. Maths Friday"/>

          <TextInput
              :v$="v$.description"
              v-model="v$.description.$model"
              label="Description"
              id="description"
              class="mb-8"
              placeholder="E.g. A good plan for extension students"/>

          <YearLevelInput
              label="Select year levels"
              id="year-level"
              :options="['R', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']"
              :v$="v$.yearLevels"
              v-model="v$.yearLevels.$model"
            />

          <TagSelection class="mt-8" v-model="v$.tags.$model" />

          <div class="flex flex-col justify-start">
            <GenericButton :callback="validateAndSubmit" type="purple">
              Save
            </GenericButton>
          </div>
        </div>
      </div>
    </div>
  </LessonPlanningBase>
</template>