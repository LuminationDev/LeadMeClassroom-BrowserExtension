<script setup lang="ts">
import VueMultiselect from 'vue-multiselect'
import {onMounted, reactive, ref, watch} from "vue";
import {useLessonPlanningStore} from "../stores/lessonPlanningStore";
import { useDebounce } from "../composables/debounce";
import Tag from "./Tag.vue";
import tag from "../models/tag";
const { debounce } = useDebounce()
let lessonPlanningStore = useLessonPlanningStore()

const selectedTags = ref<Array<tag>>([])
const reactiveOptions = reactive({ tagOptions: [] })
const loading = ref(false)

const props = defineProps({
  modelValue: {
    type: Array as () => Array<tag>,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

watch(selectedTags, async (newValue, oldValue) => {
  emit('update:modelValue', newValue)
})

onMounted(() => {
  retrieveTags("")
  selectedTags.value = props.modelValue
})

function debounceRetrieveTags(search: string) {
  loading.value = true
  return debounce(() => {
    retrieveTags(search)
  }, 1000)
}

async function retrieveTags(search: string) {
  const result = await lessonPlanningStore.searchTags(search)
  reactiveOptions.tagOptions.splice(0, reactiveOptions.tagOptions.length, ...result)
  loading.value = false
}

function handleAddTag(newTagName: string) {
  const newTag = {
    name: newTagName,
    id: newTagName.substring(0, 2) + Math.floor((Math.random() * 10000000)),
    isNew: true
  }
  reactiveOptions.tagOptions.push(newTag)
  selectedTags.value.push(newTag)
}

</script>
<template>
  <div class="flex flex-col w-full">
    <span class="uppercase pl-2">Tags</span>
    <VueMultiselect
        v-model="selectedTags"
        :loading="loading"
        :multiple="true"
        :searchable="true"
        :taggable="true"
        @tag="handleAddTag"
        placeholder="Start typing to find tags"
        :options="reactiveOptions.tagOptions"
        @search-change="debounceRetrieveTags"
        label="name"
        track-by="id"
    >
      <template #selection="{ search, remove, values, isOpen }">
        <div class="flex flex-row flex-wrap -mx-2">
          <Tag class="flex flex-row mx-2 mb-2" v-for="tag in values" :tag="tag" :key="tag.id" @delete="() => { remove(tag) }" :can-delete="true"/>
        </div>
      </template>
      <template #option="{ option, search }">
        <div>
          {{ option.name }}
        </div>
      </template>
    </VueMultiselect>
  </div>
</template>

<style src="../../vue-multiselect.min.css"></style>
<style>
.multiselect__tags, .multiselect__input, .multiselect__spinner {
  @apply bg-panel-background
}
.multiselect__option--highlight, .multiselect__option--highlight::after {
  @apply bg-blue-500
}
</style>