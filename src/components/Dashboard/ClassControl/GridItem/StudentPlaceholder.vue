<script setup lang="ts">

</script>

<template>
  <div class="w-48" id="student_placeholder">
    <div class="h-28 flex flex-col justify-center items-center bg-gray-default border-2 border-gray-no-student rounded-t-sm text-gray-default-text text-lg">
      <p>No active</p>
      <p>students!</p>
    </div>
    <div class="h-12 bg-gray-no-student rounded-b-sm flex">
      <button id="student_placeholder_view_button" class="w-full flex justify-center items-center cursor-default">
        <img class="w-9 h-5" src="@/assets/img/student-icon-eye.svg" alt="Icon"/>
      </button>

      <div class="h-10 mt-1 w-px bg-white"></div>

      <button class="w-full flex justify-center items-center cursor-default">
        <img class="w-5 h-3" src="@/assets/img/student-icon-ham-menu.svg" alt="Icon"/>
      </button>
    </div>
  </div>
</template>
