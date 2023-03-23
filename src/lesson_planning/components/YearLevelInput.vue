<script setup lang="ts">
import {computed} from "vue";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text'
  },
  options: {
    type: [],
    required: true
  },
  modelValue: {
    type: String,
    required: true
  },
  v$: {
    type: Object,
    required: true
  }
});

const localModel = computed({
  get() {
    return props.modelValue.split(',')
  },
  set(newValue: Array<String>) {
    console.log(newValue)
    emit('update:modelValue', newValue.sort((a, b) => {
      if (a === 'R') {
        return -1
      }
      if (b === 'R') {
        return 1
      }
      return a - b
    }).filter(element => element !== '').join(','))
  }
})

const emit = defineEmits(['update:modelValue'])

function handleOptionToggled(option: string) {
  const copy = [...localModel.value]
  const index = copy.findIndex(element => element === option)
  if (index !== -1) {
    copy.splice(index, 1)
  } else {
    copy.push(option)
  }
  localModel.value = copy
}
</script>

<template>
  <div class="flex flex-col w-full">
    {{ label }}
    <ul class="flex flex-row w-full justify-between">
      <li v-for="(option, index) in options" :id="index"
          class="uppercase w-12 h-12 border-gray-200 border-2
           rounded-2xl flex justify-center items-center cursor-pointer
            "
          :class="{
              'bg-blue-400 hover:bg-blue-500': localModel.includes(option),
              'bg-gray-100 hover:bg-gray-200': !localModel.includes(option)
            }"
          @click="() => {handleOptionToggled(option)}">
        <label
            :for="`${id}-${option}`"
        class="text-lg cursor-pointer">
          {{ option }}
        </label>
        <input
            :id="`${id}-${option}`"
            type="checkbox"
            class="hidden"
            :checked="localModel.includes(option)"
            @change="() => {handleOptionToggled(option)}">
      </li>
    </ul>
    <div class="flex flex-col items-start" v-if="v$ && v$.$error">
      <div class="text-red-800" v-for="error in v$.$errors">{{ error.$message }}</div>
    </div>
  </div>
</template>
