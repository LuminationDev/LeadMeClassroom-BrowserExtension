<script setup lang="ts">
import ClassControlClassArea from "../../../components/Dashboard/ClassControl/ClassControlClassArea.vue";
import ClassControlSessionArea from "./ClassControlSessionArea.vue";
import ClassControlStudentGrid from "./ClassControlStudentGrid.vue";
</script>

<template>
  <div>
    <!--Class Area-->
    <ClassControlClassArea />

    <!--Student Area-->
    <ClassControlStudentGrid />
  </div>
</template>
