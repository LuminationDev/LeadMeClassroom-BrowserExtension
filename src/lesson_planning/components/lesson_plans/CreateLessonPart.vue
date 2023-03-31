<script setup lang="ts">
import {reactive, ref} from "vue";
import useVuelidate from "@vuelidate/core";
import {helpers, required, url} from "@vuelidate/validators";
import Modal from "../../../components/Modals/Modal.vue";
import GenericButton from "../../../components/Buttons/GenericButton.vue";
import {useLessonPlanningStore} from "../../stores/lessonPlanningStore";
import TagSelection from "../TagSelection.vue";
import LessonPart from "../../models/lessonPart";
import TextInput from "../TextInput.vue";
import Lesson from "../../models/lesson";

const showModal = ref(false);

let lessonPlanningStore = useLessonPlanningStore()

const props = defineProps({
  lessonPart: {
    type: LessonPart,
    required: false,
  },
  lessonId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  }
});

type createLessonPartDto = {
  name: string
  description: string
  timeAllocation: string
  action: string;
  actionType: string;
}

const localLessonPart = reactive<createLessonPartDto>(
    props.lessonPart ?
        { ...props.lessonPart } :
        {
          name: '',
          description: '',
          timeAllocation: '',
          action: '',
          actionType: 'link'
        }
)

const rules = {
  action: {
    required: helpers.withMessage("Website link is required", required),
    url: url
  },
  name: {
    required
  },
  timeAllocation: {
    required
  },
  description: {
    required
  }
}

const v$ = useVuelidate(rules, {
  action: localLessonPart.action,
  name: localLessonPart.name,
  timeAllocation: localLessonPart.timeAllocation,
  description: localLessonPart.description
})

async function validateAndSubmit() {
  const result = await v$.value.$validate();
  if (!result) { return; }

  await submit();
}

function submit()
{
  switch (props.action) {
    case ('edit'):
      if (!props.lessonPart) {
        return
      }
      return lessonPlanningStore.updateLessonPart(
          props.lessonPart.id,
          localLessonPart).then((response) => {
        console.log(response)
        closeModal();
      })
    case ('create'):
      return lessonPlanningStore.createLessonPart(props.lessonId, localLessonPart).then((response) => {
        console.log(response)
        closeModal();
      })
  }
}

function closeModal() {
  v$.value.$reset();
  showModal.value = false
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <div v-on:click="showModal = true">
    <slot name="button">
      <button class="
    w-56 h-9 flex justify-center items-center
    bg-blue-500 hover:bg-blue-400
    text-white text-base font-medium"
              id="share_button"
      >
        <img src="../../assets/external_link.svg" alt="icon representing link" class="mr-2"/>
        Add new from URL
      </button>
    </slot>
  </div>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showModal" @close="closeModal">
      <template v-slot:header>
        <header class="h-20 px-8 w-modal-width bg-white flex justify-between items-center rounded-t-lg">
          <p class="text-2xl font-medium">{{ action === 'edit' ? 'Edit lesson part' : 'Create lesson part' }}</p>

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
          <TextInput
              :v$="v$.name"
              v-model="v$.name.$model"
              label="Title"
              class="my-8"
              id="title"
              placeholder="Visit maths website"/>

          <TextInput
              :v$="v$.description"
              v-model="v$.description.$model"
              label="Description"
              class="my-8"
              id="title"
              placeholder="Spend 10 minutes reading fun maths facts"/>

          <TextInput
              :v$="v$.timeAllocation"
              v-model="v$.timeAllocation.$model"
              label="Allocated time"
              class="my-8"
              id="time_allocation"
              placeholder="10 minutes"/>

          <div class="mx-14 mt-8 py-6 bg-white flex flex-col">
            <div class="flex items-center justify-between">
              <input
                  class="h-11 ml-6 mr-6 px-4 flex-grow bg-panel-background text-base rounded-lg"
                  type="text"
                  placeholder="Paste a URL..."
                  v-model="v$.action.$model"
              />
            </div>
            <div class="mt-1 ml-6" v-if="v$.action && v$.action.$error">
              <span class="text-red-800" v-for="error in v$.action.$errors">{{ error.$message }}</span>
            </div>
          </div>
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
