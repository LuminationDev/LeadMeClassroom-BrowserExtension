<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { Follower } from "../../../../models";

defineEmits<{
  (e: 'update', value: boolean): void
  (e: 'update:screenType', value: string): void
}>()

defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  },
  controls: {
    type: Boolean,
    required: false,
    default: true
  },
  screenType: {
    type: String,
    required: false,
  }
});
</script>

<template>
  <div :class="{
        'h-9 bg-white flex items-center flex-shrink-0': true,
        'justify-between': controls
      }">

    <input
        v-if="!controls"
        name="test"
        type="checkbox"
        class="h-5 w-5 mx-2 cursor-pointer"
        :disabled="follower.disconnected"
        @input="$emit('update', $event.target.checked)"
    >

    <!--Follower name-->
    <label for="test" class="text-sm" :class="{
          'mr-3 text-sm overflow-hidden whitespace-nowrap text-ellipsis': true,
          'ml-2.5': controls,
          'text-gray-400': follower.disconnected,
          'text-black': !follower.disconnected
        }">{{ follower.name }}</label>

    <div v-if="controls">
      <!--Options screen & Remove screen-->
      <img
          v-if="screenType === 'options' || screenType === 'remove'"
          v-on:click="$emit('update:screenType', 'tabs')"
          class="w-4 h-4 mr-2 cursor-pointer"
          src="@/assets/img/options-back.svg"
          alt="menu icon"
      />

      <!--Tab screen & Disconnect screen-->
      <img
          v-else-if="!follower.offTask"
          v-on:click="$emit('update:screenType', 'options')"
          class="w-4 h-4 mr-2 cursor-pointer"
          src="@/assets/img/student-icon-menu.svg"
          alt="menu icon"
      />

      <img
          v-else-if="follower.offTask"
          v-on:click="$emit('update:screenType', 'options')"
          class="w-6 h-6 mr-2 cursor-pointer"
          src="@/assets/img/student-icon-alert.svg"
          alt="alert icon"
      />
    </div>
  </div>
</template>
