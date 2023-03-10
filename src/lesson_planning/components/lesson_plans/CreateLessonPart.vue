<script setup lang="ts">
// todo - see if we can unify this with AddBookmark.vue somehow
import {ref} from "vue";
import useVuelidate from "@vuelidate/core";
import {helpers, required, url} from "@vuelidate/validators";
import Modal from "../../../components/Modals/Modal.vue";
import GenericButton from "../../../components/Buttons/GenericButton.vue";
import {useLessonPlanningStore} from "../../stores/lessonPlanningStore";
import TagSelection from "../TagSelection.vue";
import tag from "../../models/tag";
import Lesson from "../../models/lesson";

const showModal = ref(false);
const websiteLink = ref("");
const name = ref("");
const tags = ref<Array<tag>>([])

let lessonPlanningStore = useLessonPlanningStore()

const props = defineProps({
  lesson: {
    type: Lesson,
    required: true,
  },
});

const rules = {
  websiteLink: {
    required: helpers.withMessage("Website link is required", required),
    url: url
  },
  name: {
    required
  }
}

const v$ = useVuelidate(rules, { name, websiteLink })

async function validateAndSubmit() {
  const result = await v$.value.$validate();
  if (!result) { return; }

  submit();
}

function submit()
{
  lessonPlanningStore.createLessonPart(props.lesson.id, {
    name: name.value,
    action: websiteLink.value,
    actionType: 'link',
    yearLevels: '5,6',
    description: 'Temp Description',
    timeAllocation: 0
  }).then((response) => {
    console.log(response)
    closeModal();
  })
}

function closeModal() {
  v$.value.$reset();
  showModal.value = false
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button class="
    w-56 h-9 flex justify-center items-center
    bg-blue-500 hover:bg-blue-400
    text-white text-base font-medium"
          v-on:click="showModal = true"
          id="share_button"
  >
    <img src="../../assets/external_link.svg" alt="icon representing link" class="mr-2"/>
    Add new from URL
  </button>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showModal" @close="closeModal">
      <template v-slot:header>
        <header class="h-20 px-8 w-modal-width bg-white flex justify-between items-center rounded-t-lg">
          <p class="text-2xl font-medium">Save a new link</p>

          <img
              v-on:click="closeModal"
              class="w-4 h-4 cursor-pointer"
              src="@/assets/img/modal-icon-exit.svg"
              alt="Close Icon"
          />
        </header>
      </template>

      <template v-slot:content>
        <div class="w-modal-width">
          <div class="mx-14 mt-8 py-6 bg-white flex flex-col">
            <div class="flex items-center justify-between">
              <input
                  class="h-11 ml-6 mr-6 px-4 flex-grow bg-panel-background text-base rounded-lg"
                  type="text"
                  placeholder="Enter a name"
                  v-model="v$.name.$model"
              />
            </div>
            <div class="mt-1 ml-6" v-if="v$.name && v$.name.$error">
              <span class="text-red-800" v-for="error in v$.name.$errors">{{ error.$message }}</span>
            </div>
          </div>
          <div class="mx-14 mt-8 py-6 bg-white flex flex-col">
            <div class="flex items-center justify-between">
              <input
                  class="h-11 ml-6 mr-6 px-4 flex-grow bg-panel-background text-base rounded-lg"
                  type="text"
                  placeholder="Paste a URL..."
                  v-model="v$.websiteLink.$model"
              />
            </div>
            <div class="mt-1 ml-6" v-if="v$.websiteLink && v$.websiteLink.$error">
              <span class="text-red-800" v-for="error in v$.websiteLink.$errors">{{ error.$message }}</span>
            </div>
          </div>
          <div class="mx-14 mt-8 py-6 bg-white flex flex-col">
            <TagSelection v-model="tags" class="mx-6" />
          </div>
          {{ tags }}
        </div>
      </template>

      <template v-slot:footer>
        <footer class="mt-11 mb-8 mr-14 text-right flex flex-row justify-end">
          <button class="w-36 h-11 mr-4 text-blue-500 text-base rounded-lg hover:bg-gray-default font-medium"
                  v-on:click="showModal = false"
          >Cancel</button>
          <GenericButton
              class="w-52 h-12 text-white bg-blue-500 rounded-lg text-base hover:bg-blue-400 font-medium"
              :callback="validateAndSubmit"
          >Add to library</GenericButton>
        </footer>
      </template>
    </Modal>
  </Teleport>
</template>
