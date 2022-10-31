<script setup>
import ClassControlClassArea from "@/components/Dashboard/ClassControl/ClassControlClassArea.vue";
import ClassControlSessionArea from "@/components/Dashboard/ClassControl/ClassControlSessionArea.vue";
import ClassControlStudentArea from "@/components/Dashboard/ClassControl/ClassControlStudentArea.vue";
</script>

<template>
  <div>
    <!--Current Session Area-->
    <ClassControlSessionArea />

    <!--Class Area-->
    <ClassControlClassArea />

    <!--Student Area-->
    <ClassControlStudentArea />
  </div>
</template>
