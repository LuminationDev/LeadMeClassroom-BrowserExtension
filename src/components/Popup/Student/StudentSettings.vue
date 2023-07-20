<script setup lang="ts">
import GenericButton from "../../Buttons/GenericButton.vue";
import EditIcon from "../../../assets/vue/EditIcon.vue";
import DoorIcon from "../../../assets/vue/DoorIcon.vue";
import { usePopupStore } from "../../../stores/popupStore";
import {ref} from "vue";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

const popupPinia = usePopupStore();
const name = ref('');
const rules = {
  name: {
    required: helpers.withMessage("Name is required", required),
    $autoDirty: true
  }
}

const v$ = useVuelidate(rules, { name })

const changeName = async () => {
  const result = await v$.value.$validate();
  if (!result) { return; }

  await popupPinia.changeName(name.value);
}
</script>

<template>
  <div class="h-full flex flex-col mx-6">
    <div class="text-xsm text-gray-400 text-left font-semibold mt-4 mb-2">USER SETTINGS</div>

    <input v-model="name" class="w-full h-11 px-3 mb-2 border-2 border-gray-300 rounded-lg" placeholder="Your Name"/>

    <div class="flex flex-col flex-grow">
      <GenericButton
          class="flex flex-row justify-center items-center w-full h-9 font-normal text-white bg-blue-500 hover:bg-blue-300"
          :type="'primary'"
          :callback="changeName"
      >
        <EditIcon class="mr-2 w-4" :colour="'white'"/>
        <div class="text-sm">Change Name</div>
      </GenericButton>

      <div class="flex flex-col items-start" v-if="v$ && v$.$error">
        <div class="text-red-800" v-for="error in v$.$errors">{{ error.$message }}</div>
      </div>
    </div>

    <GenericButton
        class="flex flex-row justify-center items-center w-full h-8 mb-6 text-black bg-gray-300 hover:bg-gray-200"
        :type="'primary'"
        :callback="popupPinia.handleEndSessionClick"
    >
      <DoorIcon class="mr-2 w-4" :colour="'black'"/>
      <div class="text-sm">Leave Class</div>
    </GenericButton>
  </div>
</template>
