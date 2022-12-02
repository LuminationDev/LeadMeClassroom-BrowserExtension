<script setup lang="ts">
import VOtpInput from 'vue3-otp-input'
import {computed, ref, onMounted} from "vue";
import useVuelidate from "@vuelidate/core";
import { required, sameAs, helpers } from "@vuelidate/validators";
import GenericButton from "../../Buttons/GenericButton.vue";

import {usePopupStore} from "../../../stores/popupStore";
const popupPinia = usePopupStore();

const classFound = ref(false);
const authorise = ref(false);
const otpCode = ref(null)

const classCode = computed(() => {
  return popupPinia.classCode
})

const rules = {
  classCode: {
    required: helpers.withMessage("Class code is required", required),
    $autoDirty: true
  },
  authorise: {
    required: helpers.withMessage("Email is required", required),
    sameAs: helpers.withMessage("You must accept the permissions", sameAs(true)),
    $autoDirty: true
  }
}

const v$ = useVuelidate(rules, { classCode, authorise })

const authoriseModel = computed({
  get() {
    return !!v$.value.authorise.$model
  },
  set(newValue) {
    // @ts-ignore
    v$.value.authorise.$model = newValue
  }
})

async function validateAndSubmit() {
  const result = await v$.value.$validate();
  if (!result) { return; }

  const connected = await popupPinia.connect();

  console.log(connected);
  if(connected) {
    classFound.value = true;
    setTimeout(() => {
      window.close()
    }, 1000)
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
</script>

<template>
  <form class="mt-9 pb-7" @submit.prevent>
    <div class="flex flex-col justify-center mb-4 ml-2">
      <VOtpInput
          ref="otpCode"
          class="mr-3"
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

    <div class="mb-4 flex items-start flex-col">
      <label class="inline-flex items-center">
        <input class="w-4 h-4" v-model="authoriseModel" type="checkbox"/>
        <p :class="{
          'w-56 ml-4 text-xsm text-left': true,
          'text-gray-popup-text': authorise,
          'text-red-800': !authorise && v$.authorise.$dirty
        }">I authorise the <span @click.prevent="popupPinia.changeView('permissions')" class="underline underline-offset-1 cursor-pointer">permissions</span> necessary for LeadMe Classroom to function</p>
      </label>
      <div class="ml-8 mt-1" v-if="v$.authorise && v$.authorise.$error">
        <span class="text-red-800" v-for="error in v$.authorise.$errors">{{ error.$message }}</span>
      </div>
    </div>

    <GenericButton class="flex justify-center items-center" :type="'secondary'" :callback="validateAndSubmit">
      <img v-if="classFound" class="w-8 h-8" src="@/assets/img/tick.svg" alt="Icon"/>
      <p v-else>Enter</p>
    </GenericButton>
    <p class="text-red-400">{{ popupPinia.error }}</p>

    <p class="mt-14 text-gray-separator cursor-pointer" v-on:click="popupPinia.changeView('loginTeacher')">Teacher Login</p>
  </form>
</template>
