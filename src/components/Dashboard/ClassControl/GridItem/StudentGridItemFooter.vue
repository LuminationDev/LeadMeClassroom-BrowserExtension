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
const childRef = ref<InstanceType<typeof ScreenMonitorModal> | null>(null)
function openMonitorModal() {
  childRef.value?.initiateMonitoring();
}
</script>

<template>
  <!--Student Footer-->
  <!--Disconnected screen-->
  <div v-if="follower.disconnected" class="h-12 bg-navy-side-menu rounded-b-sm flex">
    <button @click="removeFollower" class="w-full flex justify-center items-center">
      <span class="text-sm text-white font-poppins">Dismiss</span>
    </button>
  </div>

  <!--Rename screen--->
  <div v-else-if="screenType === 'options' && renaming" class="h-12 bg-navy-side-menu rounded-b-sm flex">
    <button @click="updateFollowerName" class="w-full flex justify-center items-center">
      <span class="text-sm text-white font-poppins">Update</span>
    </button>
  </div>

  <!--Options screen-->
  <div v-else-if="screenType === 'options'" class="h-12 bg-navy-side-menu rounded-b-sm flex">
    <button @click="$emit('update:screenType', 'tabs')" class="w-full flex justify-center items-center">
      <span class="text-sm text-white font-poppins">Return</span>
    </button>
  </div>

  <!--Remove screen--->
  <div v-else-if="screenType === 'remove'" class="h-12 bg-navy-side-menu rounded-b-sm flex">
    <button @click="kickFollower" class="w-full flex justify-center items-center">
      <span class="text-sm text-white font-poppins">Confirm</span>
    </button>
  </div>

  <!--Tab screen-->
  <div v-else-if="controls" class="h-12 bg-navy-side-menu rounded-b-sm flex">
    <!--Screenshot and WebRTC modal-->
    <ScreenMonitorModal ref="childRef" :follower="follower" />

    <div class="h-10 mt-1 w-px bg-white"></div>

    <!--Expanded student details modal-->
    <StudentDetailModal @screenMonitor="openMonitorModal" :follower="follower" />
  </div>
</template>
