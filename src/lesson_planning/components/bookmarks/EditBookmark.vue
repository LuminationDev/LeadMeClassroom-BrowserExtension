<script setup lang="ts">
import {reactive, ref} from "vue";
import useVuelidate from "@vuelidate/core";
import {helpers, required, url} from "@vuelidate/validators";
import Modal from "../../../components/Modals/Modal.vue";
import GenericButton from "../../../components/Buttons/GenericButton.vue";
import TagSelection from "../TagSelection.vue";
import Bookmark from "../../models/bookmark";

const props = defineProps({
  bookmark: {
    type: Bookmark,
    required: true
  },
  submitCallback: {
    type: Function,
    required: true
  }
});

const localBookmark = reactive<Bookmark>({ ...props.bookmark })

const showModal = ref(false);

const rules = {
  action: {
    required: helpers.withMessage("Website link is required", required),
    url: url
  },
  name: {
    required
  },
  tags: {}
}

const v$ = useVuelidate(rules,
    localBookmark
)

async function validateAndSubmit() {
  const result = await v$.value.$validate();
  if (!result) { return; }

  submit();
}

function submit()
{
  props.submitCallback(localBookmark).then(() => {
    closeModal();
  })
}

function closeModal() {
  v$.value.$reset();
  showModal.value = false
}

function openModal() {
  showModal.value = true
  Object.assign(localBookmark, props.bookmark)
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button class="
    w-56 h-9 flex justify-center items-center
    bg-blue-500 hover:bg-blue-400
    text-white text-base font-medium"
          v-on:click="openModal"
          id="share_button"
  >
    <slot name="button">
      <img src="../../assets/external_link.svg" alt="icon representing link" class="mr-2"/>
      New bookmark
    </slot>
  </button>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showModal" @close="closeModal">
      <template v-slot:header>
        <header class="h-20 px-8 w-modal-width bg-white flex justify-between items-center rounded-t-lg">
          <p class="text-2xl font-medium">
            <slot name="heading">
              Save a new link
            </slot>
          </p>

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
                  v-model="v$.action.$model"
              />
            </div>
            <div class="mt-1 ml-6" v-if="v$.action && v$.action.$error">
              <span class="text-red-800" v-for="error in v$.action.$errors">{{ error.$message }}</span>
            </div>
          </div>
          <div class="mx-14 mt-8 py-6 bg-white flex flex-col">
            <TagSelection v-model="v$.tags.$model" class="mx-6" />
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <footer class="mt-11 mb-8 mr-14 text-right flex flex-row justify-end">
          <button class="w-36 h-11 mr-4 text-blue-500 text-base rounded-lg hover:bg-gray-default font-medium"
                  v-on:click="closeModal"
          >Cancel</button>
          <GenericButton
              class="w-52 h-12 text-white bg-blue-500 rounded-lg text-base hover:bg-blue-400 font-medium"
              :callback="validateAndSubmit"
          >
            <slot name="submitButton">
              Add to library
            </slot>
          </GenericButton>
        </footer>
      </template>
    </Modal>
  </Teleport>
</template>
