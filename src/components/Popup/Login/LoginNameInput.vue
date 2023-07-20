<script setup lang="ts">
import TextInput from "../../InputFields/TextInput.vue";
import { computed, ref } from "vue";
import { helpers, required, sameAs } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import GenericButton from "../../Buttons/GenericButton.vue";
import { usePopupStore } from "../../../stores/popupStore";

const popupPinia = usePopupStore();
const authorise = ref(false);
const name = ref('');

const rules = {
  name: {
    required: helpers.withMessage("Name is required", required),
    $autoDirty: true
  },
  authorise: {
    required: helpers.withMessage("You must accept the permissions", required),
    sameAs: helpers.withMessage("You must accept the permissions", sameAs(true)),
    $autoDirty: true
  }
}

const v$ = useVuelidate(rules, { name, authorise })

async function validateAndSubmit() {
  const result = await v$.value.$validate();
  if (!result) { return; }

  const connected = await popupPinia.connect(name.value);

  if(connected) {
    setTimeout(() => {
      window.close()
    }, 1000);
  }
}

const authoriseModel = computed({
  get() {
    return !!v$.value.authorise.$model
  },
  set(newValue) {
    // @ts-ignore
    v$.value.authorise.$model = newValue
  }
})

const backToRoomCode = () => {
  popupPinia.classCode = '';
  popupPinia.changeView('login');
}
</script>

<template>
  <div class="flex flex-col items-center">

    <!--Placeholder img for now-->
    <div class="flex justify-center pt-5 mb-4">
      <img class="h-6 w-6" src="/src/assets/img/icon-128.png" alt="logo"/>
    </div>
    <div class="text-white">
      {{popupPinia.teacherName}}'{{ popupPinia.teacherName.endsWith('s') ? '' : 's' }} Class
    </div>

    <form class="mt-9 pb-7" @submit.prevent>
      <div class="mb-4">
        <TextInput v-model="name" :v$="v$.name" class="text-center" type="text" placeholder="Student Name"/>
        <p class="text-red-400">{{ popupPinia.error }}</p>
      </div>

      <div class="mb-4 flex flex-col">
        <label class="inline-flex items-center">
          <input class="w-4 h-4" v-model="authoriseModel" type="checkbox"/>
          <span :class="{
              'w-56 ml-4 text-xsm text-white text-left': true,
              'text-white': authorise,
              'text-red-800': !authorise && v$.authorise.$dirty
            }">I authorise the <span @click.prevent="popupPinia.changeView('permissions')" class="underline underline-offset-1 cursor-pointer">permissions</span> necessary for LeadMe Classroom to function</span>
        </label>
        <div class="ml-8 mt-1" v-if="v$.authorise && v$.authorise.$error">
          <span class="text-red-800" v-for="error in v$.authorise.$errors">{{ error.$message }}</span>
        </div>
      </div>

      <GenericButton class="w-32 text-sm" :type="'secondary'" :callback="validateAndSubmit">Confirm</GenericButton>

      <p class="mt-4 text-blue-400 cursor-pointer" v-on:click="backToRoomCode">Back to Room Code</p>
    </form>
  </div>
</template>
