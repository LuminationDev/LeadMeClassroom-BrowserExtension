<script setup lang="ts">
import SettingsCogIcon from "../../../assets/vue/SettingsCogIcon.vue";
import { usePopupStore } from "../../../stores/popupStore";
import { computed } from "vue";
let popupPinia = usePopupStore();

const title = computed(() => {
  switch(popupPinia.view) {
    case "sessionStudent":
      return `${popupPinia.teacherName}${popupPinia.teacherName.endsWith('s') ? '\'' : '\'s' } Class`;
    case "sessionQuestion":
      return "Ask a Question"
    case "sessionSettings":
      return "Settings"
    default:
      return "Classroom"
  }
});

const goBack = computed(() => {
  switch(popupPinia.view) {
    case "sessionQuestion":
      return "Cancel"
    case "sessionSettings":
      return "Done"
    default:
      return "Back"
  }
});
</script>

<template>
  <div class="flex flex-row h-6 px-6 justify-between items-center">
    <div class="flex flex-row font-semibold text-base items-center">
      <img class="h-5 w-5 mr-2" src="/src/assets/img/icon-128.png" alt="logo"/>
      {{title}}
    </div>

    <div>
      <Transition name="fade" mode="out-in">
        <SettingsCogIcon
            v-if="popupPinia.view === 'sessionStudent'"
            v-on:click="popupPinia.changeView('sessionSettings')"
            class="w-6 cursor-pointer" :colour="'black'"/>

        <div
            v-else-if="popupPinia.view === 'sessionQuestion' || popupPinia.view === 'sessionSettings'"
            v-on:click="popupPinia.changeView('sessionStudent')"
            class="cursor-pointer text-gray-500 font-semibold">
          {{goBack}}
        </div>
      </Transition>
    </div>
  </div>
</template>
