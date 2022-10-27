<script setup>
import DashboardClassArea from "@/components/Dashboard/DashboardClassArea.vue";
import DashboardSessionArea from "@/components/Dashboard/DashboardSessionArea.vue";
import DashboardStudentArea from "@/components/Dashboard/DashboardStudentArea.vue";
import {ref} from "vue";

</script>

<template>
  <div class="flex flex-col flex-grow bg-panel-background font-poppins">
    <!--Current Session Area-->
    <DashboardSessionArea />

    <!--Class Area-->
    <DashboardClassArea />

    <!--Student Area-->
    <DashboardStudentArea />
  </div>
</template>
