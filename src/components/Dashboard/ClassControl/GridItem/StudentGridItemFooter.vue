<script setup lang="ts">
import StudentDetailModal from "../../../../components/Modals/StudentDetailModal.vue";
import ScreenMonitorModal from "../../../../components/Modals/ScreenMonitorModal.vue";
import {defineProps, PropType, ref} from "vue";
import {Follower} from "../../../../models";
import { useDashboardStore } from "../../../../stores/dashboardStore";
const dashboardPinia = useDashboardStore();

const emit = defineEmits<{
  (e: 'update:removing', value: boolean): void
  (e: 'update:screenType', value: string): void
}>()

const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  },
  controls: {
    type: Boolean,
    required: false,
    default: true
  },
  name: {
    type: String,
    required: false,
  },
  renaming: {
    type: Boolean,
    required: false,
    default: false
  },
  removing: {
    type: Boolean,
    required: false,
    default: false
  },
  screenType: {
    type: String,
    required: false,
    default: 'tabs'
  }
});

defineExpose({
  openDetailsModal
});

/**
 * Remove the follower from the class.
 */
const kickFollower = () => {
  dashboardPinia.endIndividualSession(props.follower.getUniqueId());
}

const updateFollowerName = () => {
  if(props.name === undefined) { return; }
  props.follower.name = props.name;
  dashboardPinia.renameFollower(props.name, props.follower.getUniqueId());
}

const removeFollower = () => {
  emit('update:removing', true);
  setTimeout(() => {
    dashboardPinia.removeFollower(props.follower.getUniqueId())
  }, 500)
}

//Reference to the screen monitor modal to open it externally
const monitorRef = ref<InstanceType<typeof ScreenMonitorModal> | null>(null)
function openMonitorModal() {
  monitorRef.value?.initiateMonitoring();
}

const detailsRef = ref<InstanceType<typeof StudentDetailModal> | null>(null)
function openDetailsModal() {
  detailsRef.value?.openModal();
}
</script>

<template>
    <!--Student Footer-->
    <div v-if="controls" class="h-12 bg-navy-side-menu rounded-b-sm flex">
      <Transition name="fade" mode="out-in">

        <!--Disconnected screen-->
        <button v-if="follower.disconnected" @click="removeFollower" class="w-full flex justify-center items-center">
          <span class="text-sm text-white font-poppins">Dismiss</span>
        </button>

        <!--Rename screen--->
        <button v-else-if="screenType === 'options' && renaming" @click="updateFollowerName" class="w-full flex justify-center items-center">
          <span class="text-sm text-white font-poppins">Update</span>
        </button>

        <!--Options screen-->
        <button v-else-if="screenType === 'options'" @click="$emit('update:screenType', 'tabs')" class="w-full flex justify-center items-center">
          <span class="text-sm text-white font-poppins">Return</span>
        </button>

        <!--Remove screen--->
        <button v-else-if="screenType === 'remove'" @click="kickFollower" class="w-full flex justify-center items-center">
          <span class="text-sm text-white font-poppins">Confirm</span>
        </button>

        <!--Tab screen-->
        <div v-else-if="controls" class="flex w-full">
          <!--Screenshot and WebRTC modal-->
          <ScreenMonitorModal ref="monitorRef" :follower="follower" />

          <div class="h-10 mt-1 w-px bg-white"></div>

          <!--Expanded student details modal-->
          <StudentDetailModal ref="detailsRef" @screenMonitor="openMonitorModal" :follower="follower" />
        </div>

      </Transition>
    </div>
</template>
