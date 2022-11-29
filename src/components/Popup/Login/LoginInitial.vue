<script setup lang="ts">
import { usePopupStore } from "../../../stores/popupStore";
import GenericButton from "../../Buttons/GenericButton.vue";
const popupPinia = usePopupStore();

function changeToTeacher() {
  popupPinia.changeView('loginTeacher')
}

function changeToStudent() {
  popupPinia.changeView('loginStudent')
}
</script>

<template>
  <div class="mt-9 pb-16">
    <p class="text-left mb-3 text-gray-separator">I am a...</p>
    <GenericButton :type="'primary'" :callback="changeToStudent">Student</GenericButton>

    <div class="relative mb-3">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-b border-gray-separator"></div>
      </div>
      <div class="relative flex justify-center">
        <span class="bg-panel-background px-2 pb-0.5 text-sm text-gray-separator">or</span>
      </div>
    </div>

    <GenericButton
        class="text-blue-500 bg-white border border-blue-500 border-2 font-bold hover:bg-white-menu-overlay"
        :type="'primary'"
        :callback="changeToTeacher"
    >Teacher</GenericButton>
  </div>
</template>
