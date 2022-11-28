<script setup lang="ts">
import DashboardSideMenu from "./DashboardSideMenu.vue";
import DashboardTitleBar from "./DashboardTitleBar.vue";

//Page layouts
import DashboardMain from "./ClassControl/ClassControlMain.vue";
import AccountMain from "./Account/AccountMain.vue";

import { onMounted, ref } from "vue";
import { useDashboardStore } from "../../stores/dashboardStore";
import { VOnboardingWrapper, VOnboardingStep, useVOnboarding } from 'v-onboarding'
import {getAuth} from "@firebase/auth";
import PopupSecondaryButton from "../Buttons/PopupSecondaryButton.vue";

const dashboardPinia = useDashboardStore();

const steps = ref([
  {
    attachTo: {
      element: '#generate_class'
    },
    content: {
      title: 'Get started',
      description: 'Generate a class code to begin your session!',
      image: '/src/assets/img/onboarding/get_started.svg'
    },
    options: {
      popper: {
        placement: 'left-start'
      }
    }
  },
  {
    attachTo: {
      element: '#generate_class'
    },
    content: {
      title: 'Share code',
      description: 'Instruct your class to punch in the code on their device',
      image: '/src/assets/img/onboarding/share_code.png'
    },
    options: {
      popper: {
        placement: 'left-start'
      }
    }
  },
  {
    attachTo: {
      element: '#share_button'
    },
    content: {
      title: 'Deliver content instantly',
      description: 'Share website content directly to your student\'s browser',
      image: '/src/assets/img/onboarding/deliver_content.png'
    },
    options: {
      popper: {
        placement: 'bottom-start'
      }
    }
  },
  {
    attachTo: {
      element: '#student_placeholder'
    },
    content: {
      title: 'Keep your students on task',
      description: 'Easily identify students who are off task, and bring them back',
      image: '/src/assets/img/onboarding/keep_on_task.png'
    },
    options: {
      popper: {
        placement: 'right-start'
      }
    }
  },
  {
    attachTo: {
      element: '#student_placeholder_view_button'
    },
    content: {
      title: 'View their screen in real time',
      description: 'Request to view a student\'s screen to stay on top',
      image: '/src/assets/img/onboarding/keep_on_task.png'
    },
    options: {
      popper: {
        placement: 'right-start'
      }
    }
  }
])

const wrapper = ref(null)
const { start, goToStep, finish } = useVOnboarding(wrapper)

function closeOnboarding() {
  chrome.storage.sync.set({
    "onboarding_completed": true
  });
  finish()
}

const emailVerified = ref(false)

//Check for any active class on load
onMounted(() => {
  const auth = getAuth()
  if (auth && auth.currentUser) {
    emailVerified.value = auth.currentUser.emailVerified
  }
  dashboardPinia.attachClassListeners(true)
  chrome.storage.sync.get("onboarding_completed", async (data) => {
    if (data && data.onboarding_completed === true) {
      return;
    }
    start()
  });
});
</script>

<template>
  <div class="flex font-poppins">
    <!--SideMenu-->
    <DashboardSideMenu />

    <div v-if="emailVerified" class="flex flex-grow flex-col h-screen">
      <!--TitleBar-->
      <DashboardTitleBar />

      <!--MainArea-->
      <div class="flex flex-col flex-grow bg-panel-background font-poppins">
        <DashboardMain v-show="dashboardPinia.view === 'dashboard'"/>
        <AccountMain v-show="dashboardPinia.view === 'account'"/>
      </div>
    </div>
    <div v-else class="flex justify-center items-center w-full">
      Your email is not verified. Please verify it to continue.
    </div>
    <VOnboardingWrapper ref="wrapper" :steps="steps">
      <template #default="{ previous, next, step, exit, isFirst, isLast, index }">
        <VOnboardingStep :options="step.options">
          <div class="bg-white shadow sm:rounded-lg m-2 h-96 w-onboarding-width">
            <div class="flex flex-col justify-between h-full">
              <div class="flex justify-end px-6 pt-6">
                <button @click="closeOnboarding">
                  <img src="/src/assets/img/onboarding/close.svg"/>
                </button>
              </div>
              <div class="px-6 py-6">
                <div v-if="step.content" class="flex flex-row">
                  <div class="pr-16">
                    <h3 v-if="step.content.title" class="text-2xl font-medium leading-8">{{ step.content.title }}</h3>
                    <div v-if="step.content.description" class="mt-2 text-lg font-normal">
                      <p>{{ step.content.description }}</p>
                    </div>
                  </div>
                  <img :src="step.content.image" class="w-52" />
                </div>
              </div>

              <div>
              <div class="border-t-gray-200 border-t-2 px-6 py-6 flex flex-row justify-between items-center">
                <div class="flex flex-row align-middle h-full">
                  <button
                      @click="() => {goToStep(indexCounter)}"
                      v-for="(stepCounter, indexCounter) in steps"
                      class="h-2.5 w-2.5 rounded-2xl first:ml-0 ml-2"
                      :class="index === indexCounter ? 'bg-blue-500' : 'bg-gray-300'"/>
                </div>
                <div>
                  <button @click="closeOnboarding" class="text-md text-lg">Skip</button>
                  <button v-if="!isLast" @click="next" class="text-blue-500 text-lg ml-4">Next</button>
                  <button v-else @click="closeOnboarding" class="text-blue-500 text-lg ml-4">Finish</button>
                </div>
              </div>
              </div>
            </div>
          </div>
        </VOnboardingStep>
      </template>
    </VOnboardingWrapper>
  </div>
</template>


<style>
[data-v-onboarding-wrapper] [data-popper-arrow]::before {
  content: '';
  background: white;
  top: 0;
  left: 0;
  transition: transform 0.2s ease-out,visibility 0.2s ease-out;
  visibility: visible;
  transform: translateX(0px) rotate(45deg);
  transform-origin: center;
  width: 10px;
  height: 10px;
  position: absolute;
  z-index: -1;
}

[data-v-onboarding-wrapper] [data-popper-placement^='top'] > [data-popper-arrow] {
  bottom: 5px;
}

[data-v-onboarding-wrapper] [data-popper-placement^='right'] > [data-popper-arrow] {
  left: 4px;
}

[data-v-onboarding-wrapper] [data-popper-placement^='bottom'] > [data-popper-arrow] {
  top: 4px;
}

[data-v-onboarding-wrapper] [data-popper-placement^='left'] > [data-popper-arrow] {
  right: 13px;
}
</style>
