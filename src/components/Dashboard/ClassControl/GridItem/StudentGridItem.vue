<script setup lang="ts">
import {defineProps, PropType, ref} from 'vue'
import { Follower } from "../../../../models";
import StudentGridItemFooter from "./StudentGridItemFooter.vue";
import StudentGridItemContent from "./StudentGridItemContent.vue";
import StudentGridItemHeader from "./StudentGridItemHeader.vue";
import { useDashboardStore } from "../../../../stores/dashboardStore";
const dashboardPinia = useDashboardStore();

const emit = defineEmits<{
  (e: 'update', value: boolean): void
}>()

/**
 * Bubble the emit up to the share website modal when required.
 * @param value
 */
function checked(value: boolean) {
  emit('update', value);
}

const removing = ref(false);
const screenType = ref("tabs");
const renaming = ref(false);
const name = ref("");

defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  },
  controls: {
    type: Boolean,
    required: false,
    default: true
  }
});

/**
 * Opens the
 */
const detailsRef = ref<InstanceType<typeof StudentGridItemFooter> | null>(null)
function openDetails() {
  detailsRef.value?.openDetailsModal();
}
</script>

<template>
  <div class="w-48 transition-all duration-500 ease-in-out" :class="removing ? 'opacity-0' : ''" :id="follower.getUniqueId()">
    <div class="h-[120px] flex flex-col bg-gray-active-student border-2 border-navy-side-menu rounded-t-sm">
      <StudentGridItemHeader
          @update="checked"
          :follower="follower"
          :controls="controls"
          v-model:screenType="screenType"
          @studentDetails="openDetails" />

      <StudentGridItemContent
          :follower="follower"
          :controls="controls"
          v-model:name="name"
          v-model:renaming="renaming"
          v-model:screenType="screenType" />
    </div>

    <StudentGridItemFooter
        ref="detailsRef"
        :follower="follower"
        :controls="controls"
        :name="name"
        :renaming="renaming"
        v-model:removing="removing"
        v-model:screenType="screenType"/>
  </div>
</template>
