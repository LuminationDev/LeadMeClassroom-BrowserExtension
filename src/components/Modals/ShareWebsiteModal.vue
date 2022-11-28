<script setup lang="ts">
import {Ref, ref} from "vue";
import {useDashboardStore} from "../../stores/dashboardStore";
import useVuelidate from "@vuelidate/core";
import {helpers, required} from "@vuelidate/validators";
import StudentGridItem from "../Dashboard/ClassControl/GridItem/StudentGridItem.vue";
import Modal from "./Modal.vue";

const dashboardPinia = useDashboardStore();
const showWebsiteModal = ref(false);
const websiteLink = ref("");
const shareTo = ref("all")
const followersSelected: Ref<string[]> = ref([])

const rules = {
  websiteLink: {
    required: helpers.withMessage("Website link is required", required)
  }
}

const v$ = useVuelidate(rules, { websiteLink })

function validateAndSubmit() {
  !v$.value.$validate().then((result: boolean) => {
    if (!result) {
      return;
    }
    submit()
  })
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
  showWebsiteModal.value = false
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button class="
    w-56 h-9 flex justify-center items-center
    bg-blue-500 hover:bg-blue-400
    text-white text-base"
    v-on:click="showWebsiteModal = true"
    id="share_button"
  >
    <img class="w-4 h-4 mr-3" src="@/assets/img/session-icon-share.svg" alt="Icon"/>

      Share Website

  </button>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showWebsiteModal" @close="closeModal">
      <template v-slot:header>
        <header class="h-20 px-8 w-modal-width bg-white flex justify-between items-center rounded-t-lg">
          <p class="text-2xl">Share links with your class</p>

          <img
              v-on:click="showWebsiteModal = false"
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
            <p class="ml-8 text-lg">Share to</p>
            <div class="flex">
              <label class="mr-14 flex justify-between items-center">
                <input class="h-5 w-5 mr-4" name="shareTo" type="radio" v-model="shareTo" value="all">
                <p class="text-base">All connected users</p>
              </label>

              <label class="mr-20 flex justify-between items-center">
                <input class="h-5 w-5 mr-4" name="shareTo" type="radio" v-model="shareTo" value="selected">
                <p class="text-base">Select users</p>
              </label>
            </div>
          </div>
        </div>
        <div class="w-modal-width max-h-64 overflow-y-auto">
          <div v-if="shareTo === 'selected'"
               class="mt-4 flex flex-row flex-wrap ml-10 mr-14">
            <StudentGridItem v-for="follower in dashboardPinia.followers" class="pl-4 pt-4 w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6" :follower="follower" :controls="false" @update="(value: boolean) => { handleFollowerSelection(follower.getUniqueId(), value) }"/>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <footer class="mt-11 mb-8 mr-14 text-right">
          <button class="w-36 h-11 mr-4 text-blue-500 text-base rounded-lg hover:bg-gray-default"
                  v-on:click="showWebsiteModal = false"
          >Cancel</button>
          <button
              class="w-52 h-11 text-white bg-blue-500 rounded-lg text-base hover:bg-blue-400"
              v-on:click="validateAndSubmit"
          >Share link</button>
        </footer>
      </template>
    </Modal>
  </Teleport>
</template>
