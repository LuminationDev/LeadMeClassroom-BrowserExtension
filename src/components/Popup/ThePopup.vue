<script setup lang="ts">
import PopupPanel from "./PopupPanel.vue";
import PopupLoading from "./PopupLoading.vue";
import LoginStudent from "./Login/LoginNameInput.vue";
import LoginRoomCode from "../../components/Popup/Login/LoginRoomCode.vue";
import StudentSession from "../../components/Popup/Student/StudentSession.vue";
import StudentSettings from "./Student/StudentSettings.vue";
import StudentQuestion from "./Student/StudentQuestion.vue";
import { onBeforeMount } from "vue";
import { usePopupStore } from "../../stores/popupStore";
import StudentPermissions from "./Student/StudentPermissions.vue";
import { Task } from "../../models";
import * as REQUESTS from "../../constants/_requests";

const popupPinia = usePopupStore();

const loadTasks = (message: any) => {
   if(message.tasks.length === 0) { return; }

  //List for new incoming tasks - Create the new task from the supplied data
  let newTaskList = <Task[]>[];
  message.tasks.forEach((item: string) => {
    const info = item.split("|");
    if(info.length !== 3) { return; }
    const task: Task = new Task(info[0], info[1], info[2]);
    newTaskList.push(task);
  });

  newTaskList.forEach(task => {
    if(message.action === "added") {
      const exists = popupPinia.tasks.filter(currentTask => currentTask.packageName === task.packageName);
      if (exists.length === 0) {
        popupPinia.tasks.push(task);
      }
    } else if (message.action === "removed") { //Remove the task from the list
      popupPinia.tasks = popupPinia.tasks.filter(currentTask => currentTask.packageName === task.packageName);
    }
  });
}

onBeforeMount(() => {
  //Add an incoming tasks to the popupPinia task list
  chrome.runtime.onMessage.addListener(function(message){
    switch(message.type) {
      case REQUESTS.NEWTASK:
        loadTasks(message);
    }
  });

  popupPinia.onOpen();
});
</script>

<template>
  <!--Default loading panel-->
  <PopupPanel
    :class="{'bg-[#182B50] pt-9': popupPinia.view === 'login' || popupPinia.view === 'nameInput'}"
    :show-header="popupPinia.view !== 'login' && popupPinia.view !== 'nameInput' && popupPinia.view !== 'loading'"
  >
    <!--Don't fade the load-->
    <PopupLoading v-if="popupPinia.view === 'loading'"/>

    <Transition name="fade" mode="out-in">
      <!--Entry point-->
      <!--Room Code-->
      <LoginRoomCode v-if="popupPinia.view === 'login'"/>

      <!--Name Input-->
      <LoginStudent v-else-if="popupPinia.view === 'nameInput'"/>

      <!--Student Session-->
      <StudentSession v-else-if="popupPinia.view === 'sessionStudent'"/>

      <!--Ask a Question Input-->
      <StudentQuestion v-else-if="popupPinia.view === 'sessionQuestion'"/>

      <!--Student Settings-->
      <StudentSettings v-else-if="popupPinia.view === 'sessionSettings'"/>

      <!--Student Permissions-->
      <StudentPermissions v-else-if="popupPinia.view === 'sessionPermissions'"/>
    </Transition>
  </PopupPanel>
</template>
