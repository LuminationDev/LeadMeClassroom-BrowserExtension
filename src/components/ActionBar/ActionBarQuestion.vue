<script setup lang="ts">
import { ref } from "vue";
import { usePopupStore } from "../../stores/popupStore";
import QuestionIcon from "../../assets/vue/QuestionIcon.vue";
import HandOffIcon from "../../assets/vue/HandOffIcon.vue";
import HandIcon from "../../assets/vue/HandIcon.vue";
import ActionBarBase from "./ActionBarBase.vue";

const popupPinia = usePopupStore();

const hover = ref(false);
const countdown = ref(30);
const isCounting = ref(false);

//Used to perform the sliding colour change
let interval: NodeJS.Timer;
const startCountdown = () => {
  isCounting.value = true;
  countdown.value = 30;

  interval = setInterval(() => {
    countdown.value--;

    if (countdown.value === 0) {
      clearInterval(interval);
      isCounting.value = false;
      handRaised.value = false;
    }
  }, 1000);
};

const handRaised = ref(false);
const raiseHand = () => {
  handRaised.value = !handRaised.value;

  if(handRaised.value) {
    startCountdown();
  } else {
    clearInterval(interval);
    isCounting.value = false;
  }
}
</script>

<template>
  <ActionBarBase class="flex-row items-center mx-6 mb-5">
    <template v-slot:left>
      <div v-on:click="popupPinia.changeView('sessionQuestion')"
           class="flex flex-row items-center bg-blue-400 h-7 px-2 rounded-3xl cursor-pointer hover:bg-blue-300">
        <QuestionIcon class="w-5 h-5 mr-2" :colour="'white'"/>
        <span class="text-white text-xs">Ask a Question</span>
      </div>
    </template>

    <template v-slot:right>
      <div v-on:click="raiseHand" @mouseenter="hover = true" @mouseleave="hover = false" :class="{'bg-blue-300': hover}"
           class="flex flex-row items-center bg-blue-400 h-7 px-2 rounded-3xl cursor-pointer relative overflow-hidden">
        <HandOffIcon v-if="handRaised" class="w-5 h-5 z-10" :colour="'white'"/>
        <HandIcon v-else class="w-5 h-5 z-10" :colour="'white'"/>
        <span class="text-white text-xs w-20 z-10">{{handRaised ? 'Lower Hand' : 'Raise Hand'}}</span>

        <span
            :class="{
            'bg-purple-400': isCounting,
            'bg-purple-300': isCounting && hover,
            'bg-blue-400': !isCounting,
            'bg-blue-300': hover,
            'slide-animation': isCounting
          }"
            class="absolute top-0 right-0 w-full h-full cursor-pointer"
        ></span>
      </div>
    </template>
  </ActionBarBase>
</template>

<style>
.slide-animation {
  animation: slide 30s linear forwards;
}

@keyframes slide {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
</style>