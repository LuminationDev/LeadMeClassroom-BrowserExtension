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
const connected = ref(false);

async function validateAndSubmit() {
  const result = await v$.value.$validate();
  if (!result) { return; }

  const success = await popupPinia.connect(name.value);

  if(success) {
    connected.value = true;
    setTimeout(() => {
      popupPinia.changeView('sessionStudent');
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
    <!--Successful connection attempt-->
    <div v-if="connected" class="flex flex-col items-center justify-center">
      <p class="my-10 lds-dual-ring-lg" />
      <span class="text-white">Establishing connection</span>
    </div>

    <!--Join the collected class-->
    <div v-else>
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
  </div>
</template>

<style scoped>
.lds-dual-ring-lg {
  display: inline-block;
  width: 150px;
  height: 150px;
}
.lds-dual-ring-lg:after {
  content: " ";
  display: block;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 2px solid white;
  border-color: white transparent white transparent;
  animation: lds-dual-ring-lg 1.2s linear infinite;
}
@keyframes lds-dual-ring-lg {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
