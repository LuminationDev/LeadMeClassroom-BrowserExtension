<script setup lang="ts">
import {computed, Ref, ref} from "vue";
import {useDashboardStore} from "../../stores/dashboardStore";
import useVuelidate from "@vuelidate/core";
import {helpers, required} from "@vuelidate/validators";
import StudentGridItem from "../Dashboard/ClassControl/GridItem/StudentGridItem.vue";
import Modal from "./Modal.vue";
import {Follower} from "../../models";
import GenericButton from "../Buttons/GenericButton.vue";

const dashboardPinia = useDashboardStore();
const showWebsiteModal = ref(false);
const websiteLink = ref("");
const shareTo = ref("all")
const followersSelected: Ref<string[]> = ref([])
const submissionAttempted = ref(false)

const sortedFollowers = computed((): Array<Follower> => {
  return dashboardPinia.followers.sort((a: Follower, b: Follower) => {
    return a.name.localeCompare(b.name)
  });
})

const rules = {
  websiteLink: {
    required: helpers.withMessage("Website link is required", required)
  }
}

const v$ = useVuelidate(rules, { websiteLink })

async function validateAndSubmit() {
  submissionAttempted.value = true
  if (shareTo.value === "selected" && followersSelected.value.length === 0) {
    return;
  }

  const result = await v$.value.$validate();
  if (!result) { return; }

  submit();
}

function handleFollowerSelection(followerId: string, value: boolean) {
  let index = followersSelected.value.findIndex(element => element === followerId)
  if (value) {
    if (index === -1) {
      followersSelected.value.splice(0, 0, followerId)
    }
  } else {
    if (index !== -1) {
      followersSelected.value.splice(index, 1)
    }
  }
}

function submit()
{
  if (shareTo.value === 'all') {
    dashboardPinia.launchWebsite(websiteLink.value);
  }
  if (shareTo.value === 'selected') {
    followersSelected.value.forEach(id => {
      dashboardPinia.launchWebsiteIndividual(id, websiteLink.value)
    })
  }

  closeModal();
}

function closeModal() {
  v$.value.$reset();
  showWebsiteModal.value = false
  submissionAttempted.value = false
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button class="
    w-56 h-9 flex justify-center items-center
    bg-blue-500 hover:bg-blue-400
    text-white text-base font-medium"
    v-on:click="showWebsiteModal = true"
    id="share_button"
  >
    <img class="w-4 h-4 mr-3" src="@/assets/img/session-icon-share.svg" alt="Icon"/>
      Share website
  </button>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showWebsiteModal" @close="closeModal">
      <template v-slot:header>
        <header class="h-20 px-8 w-modal-width bg-white flex justify-between items-center rounded-t-lg">
          <p class="text-2xl font-medium">Share links with your class</p>

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
                  placeholder="Paste a URL..."
                  v-model="v$.websiteLink.$model"
              />
            </div>
            <div class="mt-1 ml-6" v-if="v$.websiteLink && v$.websiteLink.$error">
              <span class="text-red-800" v-for="error in v$.websiteLink.$errors">{{ error.$message }}</span>
            </div>
          </div>
          <div class="mx-14 mt-8 h-20 bg-white flex items-center justify-between">
            <p class="ml-8 text-lg font-medium">Share to</p>
            <div class="flex">
              <label class="mr-14 flex justify-between items-center">
                <input class="h-5 w-5 mr-4" name="shareTo" type="radio" v-model="shareTo" value="all">
                <span class="text-base">All connected users</span>
              </label>

              <label class="mr-20 flex justify-between items-center">
                <input class="h-5 w-5 mr-4" name="shareTo" type="radio" v-model="shareTo" value="selected">
                <span class="text-base">Select users</span>
              </label>
            </div>
          </div>
        </div>
        <div class="w-modal-width max-h-64 overflow-y-auto">
          <div v-if="shareTo === 'selected' && dashboardPinia.followers.length"
               class="mt-4 flex flex-row flex-wrap ml-10 mr-14">
            <StudentGridItem
                v-for="follower in sortedFollowers"
                class="pl-4 pt-4 w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6"
                :follower="follower"
                :controls="false"
                @update="(value: boolean) => { handleFollowerSelection(follower.getUniqueId(), value) }"/>
          </div>
          <div class="flex justify-center items-center bg-gray-200 mx-14 mt-4 px-5 py-5" v-else-if="shareTo === 'selected'">
            <span>No students connected</span>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <footer class="mt-11 mb-8 mr-14 text-right flex flex-row justify-end">
          <button class="w-36 h-11 mr-4 text-blue-500 text-base rounded-lg hover:bg-gray-default font-medium"
                  v-on:click="showWebsiteModal = false"
          >Cancel</button>
          <div class="relative">
            <div
                v-if="submissionAttempted && shareTo === 'selected' && followersSelected.length === 0"
                class="absolute bottom-12 min-w-max right-0 rounded shadow-lg
                px-3 py-1 rounded-xl bg-white text-black border-gray-600
                border-1 flex flex-row items-center mb-2">
              <img
                  class="w-5 h-5 mr-2"
                  src="@/assets/img/student-icon-alert.svg"
                  alt="alert icon"
              />
              <span>Please select a user to share this link to</span>
              <div class="absolute bottom-0 right-0 border-b-white h-0 w-0 rotate-180 border-x-8 border-x-transparent border-b-[1rem] -mb-2 mr-10"></div>
            </div>

            <GenericButton
                class="w-52 h-12 text-white bg-blue-500 rounded-lg text-base hover:bg-blue-400 font-medium"
                :callback="validateAndSubmit"
            >Share link</GenericButton>
          </div>
        </footer>
      </template>
    </Modal>
  </Teleport>
</template>
