<script setup lang="ts">
import VOtpInput from 'vue3-otp-input'
import {computed, ref, onMounted} from "vue";
import useVuelidate from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import GenericButton from "../../Buttons/GenericButton.vue";
import { usePopupStore } from "../../../stores/popupStore";

const popupPinia = usePopupStore();

const classFound = ref(false);
const otpCode = ref(null)

const classCode = computed(() => {
  return popupPinia.classCode
})

const rules = {
  classCode: {
    required: helpers.withMessage("Class code is required", required),
    $autoDirty: true
  }
}

const v$ = useVuelidate(rules, { classCode })

async function validateAndSubmit() {
  const result = await v$.value.$validate();
  if (!result) { return; }

  //Look for a class with the supplied class code
  // -save the details if there is one
  // -otherwise show an error message
  const classroom = await popupPinia.collectClassroomDetails();
  if(classroom) {
    await popupPinia.changeView('nameInput');
  }
}

onMounted(() => {
  // fixes a validation error when letters are in the pin code, as the package by default validates for numbers only :(
  // @ts-ignore
  let children = otpCode.value.$el.children
  if (children) {
    for (let child of children) {
      child.children[0].removeAttribute('pattern')
      child.children[0].removeAttribute('min')
      child.children[0].removeAttribute('max')
    }
  }
})

const changeToTeacher = () => {
  console.log("GO TO CLASSROOM WEBSITE")
}
</script>

<template>
  <div class="flex flex-col flex-grow items-center">
    <div class="flex justify-center mt-5 mb-4">
      <img class="h-6 w-6" src="/src/assets/img/icon-128.png" alt="logo"/>
    </div>
    <div class="text-white">
      Enter your room code
    </div>

    <form class="flex flex-col justify-center mt-3" @submit.prevent>
      <div class="mb-4">
        <VOtpInput
            ref="otpCode"
            class="flex justify-center mr-3"
            :num-inputs="4"
            input-type="letter-numeric"
            inputmode="text"
            input-classes="w-11 h-16 text-center font-medium text-4xl rounded-lg border-black-form-border border-2 ml-3"
            @on-change="(code: string) => { popupPinia.classCode = code }"
            separator=""/>
        <div class="mt-2" v-if="v$.classCode && v$.classCode.$error">
          <span class="text-red-800" v-for="error in v$.classCode.$errors">{{ error.$message }}</span>
        </div>
      </div>

      <div class="flex justify-center flex-col items-center">
        <GenericButton class="flex justify-center items-center w-32" :type="'secondary'" :callback="validateAndSubmit">
          <img v-if="classFound" class="w-8 h-8" src="@/assets/img/tick.svg" alt="Icon"/>
          <p v-else class="text-sm">Join</p>
        </GenericButton>
        <p class="text-red-400 px-6 mt-2">{{ popupPinia.error }}</p>
      </div>

      <p class="mt-14 text-blue-400 cursor-pointer" v-on:click="changeToTeacher">Login as Teacher</p>
    </form>
  </div>
</template>
