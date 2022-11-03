<script setup>
import ClassControlClassArea from "@/components/Dashboard/ClassControl/ClassControlClassArea.vue";
import ClassControlSessionArea from "@/components/Dashboard/ClassControl/ClassControlSessionArea.vue";
import ClassControlStudentGrid from "@/components/Dashboard/ClassControl/ClassControlStudentGrid.vue";
</script>

<template>
  <div>
    <!--Current Session Area-->
    <ClassControlSessionArea />

    <!--Class Area-->
    <ClassControlClassArea />

    <!--Student Area-->
    <ClassControlStudentGrid />
  </div>
</template>
