<script setup lang="ts">
import Modal from "@/components/Modals/Modal.vue";
import {defineProps, PropType} from "vue";

import Follower from "../../../models/_follower";
const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  },
  showModal: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'deleteTab', id: string): void
  (e: 'hide'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Modal :show="showModal" :rounded="false">
      <template v-slot:header>
        <header class="h-20 px-8 w-modal-width-sm bg-white flex justify-between items-center rounded-t-lg">
          <div class="h-9 bg-white flex items-center">
            <span class="text-lg text-black">{{ follower.name }}</span>
          </div>
        </header>
      </template>

      <template v-slot:content>
        <div class="w-modal-width-sm h-96 pt-5 flex flex-col overflow-y-scroll">
          <div v-for="(tab, index) in follower.tabs" class="py-3" :id="tab.id">
            <div class="flex flex-row w-full px-5 items-center justify-between">
              <div class="flex-[7_7_0%] flex flex-row overflow-ellipsis whitespace-nowrap overflow-hidden">
                <img class="flex-shrink-0 w-5 h-5 mr-2" :src="tab.favicon" />
                <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5">{{ tab.url }}</span>
              </div>
              <div class="flex flex-shrink-0 flex-[1_1_auto] justify-center">
                <button v-if="!tab.closing" @click="() => { $emit('deleteTab', tab.id) }">
                  <img class="w-4 h-4" src="@/assets/img/cross.svg" />
                </button>
                <div class="lds-dual-ring w-4 h-4" v-else />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <footer class="w-modal-width-sm">
          <div class="h-12 bg-navy-side-menu rounded-b-sm flex">
            <button class="w-full flex justify-center items-center">
              <img class="w-9 h-5" src="@/assets/img/student-icon-eye.svg" alt="Icon"/>
            </button>
            <div class="h-10 mt-1 w-px bg-white"></div>
            <button class="w-full flex justify-center items-center" @click="() => { $emit('hide') }">
              <img class="w-5 h-3" src="@/assets/img/minimize.svg" alt="Icon"/>
            </button>
          </div>
        </footer>
      </template>
    </Modal>
  </Teleport>
</template>

<style>
.lds-dual-ring {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
  margin-bottom: 5px;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #182B50;
  border-color: #182B50 transparent #182B50 transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>
