<script setup>
import Modal from "@/components/Modals/Modal.vue";
import {ref} from "vue";

import { useDashboardStore } from "@/stores/dashboardStore.ts";
let dashboardPinia = useDashboardStore();

const showWebsiteModal = ref(false);
const websiteLink = ref("");
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button class="
    w-56 h-9 flex justify-center items-center
    bg-gray-default hover:bg-navy-side-menu
    text-gray-default-text
    hover:text-white"
    v-on:click="showWebsiteModal = true"
  >
    <img class="w-4 h-4 mr-3" src="@/assets/img/menu-placeholder.svg" alt="Icon"/>
    <p class="text-base">
      Share Website
    </p>
  </button>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showWebsiteModal">
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
        <div>
          <div class="mx-14 mt-8 h-20 bg-white flex items-center justify-between">
            <input
              class="h-11 ml-6 mr-24 px-4 flex-grow bg-panel-background text-base rounded-lg"
              type="text"
              placeholder="Paste a URL..."
              v-model="websiteLink"
            />
            <button class="w-52 h-11 mr-9 text-white bg-modal-blue rounded-lg text-base hover:bg-navy-side-menu">Done</button>
          </div>
          <div class="mx-14 mt-8 h-20 bg-white flex items-center justify-between">
            <p class="ml-8 text-lg">Share to</p>
            <div class="flex">
              <label class="mr-14 flex justify-between items-center">
                <input class="h-5 w-5 mr-4" name="shareTo" type="radio">
                <p class="text-base">All connected users</p>
              </label>

              <label class="mr-20 flex justify-between items-center">
                <input class="h-5 w-5 mr-4" name="shareTo" type="radio">
                <p class="text-base">Select users</p>
              </label>
            </div>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <footer class="mt-11 mb-8 mr-24 text-right">
          <button class="w-36 h-11 mr-4 text-modal-blue text-base rounded-lg hover:bg-gray-default"
                  v-on:click="showWebsiteModal = false"
          >Cancel</button>
          <button
              class="w-52 h-11 text-white bg-modal-blue rounded-lg text-base hover:bg-navy-side-menu"
              v-on:click="dashboardPinia.launchWebsite(websiteLink); showWebsiteModal = false"
          >Share link</button>
        </footer>
      </template>
    </Modal>
  </Teleport>
</template>
