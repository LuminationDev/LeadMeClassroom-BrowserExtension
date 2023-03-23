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
import ShowLessonPlans from "./ShowLessonPlans.vue";
import * as VueRouter from 'vue-router'

let lessonPlanningStore = useLessonPlanningStore()

onBeforeMount(() => {
  lessonPlanningStore.loadLessons()
})
</script>
<template>
  <div class="mt-14 mx-10 overflow-y-scroll">
    <div>
      <h1 class="text-2xl font-medium mb-4">Lesson Plans</h1>
      <router-link to="create-lesson">
        <GenericButton type="primary" :callback="() => { }">
          <div class="flex flex-row justify-center">
            <img src="../../assets/external_link.svg" alt="icon representing link" class="mr-2"/>
            <span class="font-medium">New lesson plan</span>
          </div>
        </GenericButton>
      </router-link>

    </div>
  </div>
</template>