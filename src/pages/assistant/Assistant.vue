<script setup lang="ts">
import '../../styles.css'
import { ref } from 'vue'
import ConnectionManager from '../../controller/_connectionManager'
import * as REQUESTS from '../../constants/_requests.js'
import { Tab, Follower, Task } from "../../models";
import { taskData } from "../../constants/_dataTypes";
import { useWebRTCStore } from "../../stores/webRTCStore";
import { useStorage } from "../../hooks/useStorage";

const { getSyncStorage, setSyncStorage, removeSyncStorage } = useStorage();
const webRTCPinia = useWebRTCStore();

const assistantListener = (data: any) => {
  if (data == null) { return; }

  switch (data.type) {
    case REQUESTS.MONITORPERMISSION:
      webRTCPinia.connectionStatus = true;
      monitorRequest();
      break;

    case REQUESTS.MONITORDATA:
      webRTCPinia.readIceCandidate(data, followerData.uuid);
      break;

    case REQUESTS.MONITORSTARTED:
      MANAGER.value.enableMonitoring(true);
      break;

    case REQUESTS.MONITORENDED:
      MANAGER.value.enableMonitoring(false);
      webRTCPinia.connectionStatus = false;
      webRTCPinia.stopTracks(followerData.uuid);
      break;

    case REQUESTS.CAPTURE:
      MANAGER.value.captureScreen();
      break;

    case REQUESTS.FORCEACTIVETAB:
      MANAGER.value.forceActiveTab(data.tab);
      break;

    case REQUESTS.UPDATE_TAB:
      MANAGER.value.updateTab(data.tab)
      break;

    case REQUESTS.UPDATE_ACTIVE_TAB:
      MANAGER.value.updateActiveTab(data.tab)
      break;

    case REQUESTS.REMOVE_TAB:
      MANAGER.value.removeTab(data.tabId)
      break;

    case REQUESTS.DELETE_TAB:
      MANAGER.value.deleteTab(data.tabId)
      break;

    case REQUESTS.REMOVED:
      endSession(`Leader has removed you from the session`);
      break;

    case REQUESTS.ENDSESSION:
      endSession(`Leader has ended session`);
      break;

    case REQUESTS.YOUTUBE:
    case REQUESTS.SCREENCONTROL:
    case REQUESTS.MUTETAB:
    case REQUESTS.UNMUTETAB:
    case REQUESTS.WEBSITE:
      chrome.runtime.sendMessage(data);
      break;

    case REQUESTS.TASK:
      setAndPassTask(data);
      break;

    default:
      console.log("Unknown command");
      break;
  }
}

/**
 * Save the new task information to sync storage and then pass the data onto the background script for
 * further processing.
 * @param data An object containing updated task information.
 */
const setAndPassTask = async (data: any) => {
  if(data.tasks.length === 0) { return; }

  //List for new incoming tasks - Create the new task from the supplied data
  let newTaskList = <Task[]>[];
  data.tasks.forEach((item: string) => {
    const info = item.split("|");
    if(info.length !== 3) { return; }
    const task: Task = new Task(info[0], info[1], info[2]);
    newTaskList.push(task);
  });

  //List for any current tasks
  let taskList = <Task[]>[];

  //Get the current list of tasks
  const savedData: string | undefined = await getSyncStorage("tasks");

  if(savedData !== undefined) {
    const savedTaskList: taskData[] = JSON.parse(savedData);
    const convertedData: Task[] = savedTaskList.map((savedTaskList: taskData) => new Task(savedTaskList.name, savedTaskList.packageName, savedTaskList.type));

    if(convertedData.length !== 0) {
      taskList = convertedData;

      //Update the task list - checking it does not already exist
      newTaskList.forEach(task => {
        if(data.action === "added") {
            const exists = taskList.filter(currentTask => currentTask.packageName === task.packageName);
            if(exists.length === 0) { taskList.push(task); }
        } else if (data.action === "removed") {
            taskList = taskList.filter(currentTask => currentTask.packageName !== task.packageName);
        }
      });
    }
    else {
      taskList = newTaskList;
    }
  } else {
    taskList = newTaskList;
  }

  //Set sync storage
  await setSyncStorage({"tasks": JSON.stringify(taskList)});

  //Change the data type, as to avoid an infinite loop (assistant -> background -> assistant)
  data.type = REQUESTS.NEWTASK;

  //Pass to background.ts (Only for live updates if the popup is open
  void await chrome.runtime.sendMessage(data);
}

chrome.runtime.onMessage.addListener(
    function (request, sender) {
      if (sender?.tab?.url?.includes("assistant.html")) {
        return;
      }
      assistantListener(request);
      return true;
    }
);

//Persistent connection to Firebase & WebRTC
const MANAGER = ref(new ConnectionManager(assistantListener));

//Hold a reference to the follower data
const followerData = {
  uuid: "",
  classCode: ""
}

//Start the connection manager on page load
chrome.storage.sync.get("follower", async (data) => {
  let f = new Follower(data.follower.code, data.follower.name, data.follower.teacherName, data.follower.uuid)
  setupWebRTCConnection(f.getUniqueId(), data.follower.code);

  //Collect a students tabs, filtering out the assistant page
  chrome.tabs.query({}, (tabs) => {
    f.tabs = tabs.filter(tab => { return !tab.url?.includes("assistant.html") }).map(tab => {
      let newTab = new Tab(tab.id + "", tab.index, tab.windowId, tab.title ?? "", tab.favIconUrl ?? "", tab.url ?? "")
      newTab.audible = tab.audible ?? false
      newTab.muted = tab.mutedInfo ? tab.mutedInfo.muted : false
      return newTab
    })
    MANAGER.value.connect(f);
  })
});

/**
 * Set up a followers WebRTC connection.
 * @param UUID
 * @param classCode
 */
const setupWebRTCConnection = (UUID: string, classCode: string) => {
  followerData.uuid = UUID;
  followerData.classCode = classCode;

  webRTCPinia.setConnectionDetails(sendIceCandidates, followerData.classCode, followerData.uuid);
  webRTCPinia.createNewConnection(followerData.uuid);
}

const sendIceCandidates = (senderId: string, UUID: string, data: string) => {
  MANAGER.value.firebase.sendIceCandidates(senderId, UUID, data, followerData.classCode);
}

const monitorRequest = () => {
  chrome.runtime.sendMessage({ "type": "maximize" });
  setTimeout(() => {
    webRTCPinia.prepareScreen(followerData.uuid)
        .then((result: MediaStream|string|undefined) => {
          let response;

          if(result !== "denied" && result instanceof MediaStream) {
            //Track if the students stops streaming
            result.getVideoTracks()[0].onended = function () {
              MANAGER.value.sendResponse({"type": REQUESTS.MONITORPERMISSION, message: "stopped"});
            };

            response = "granted";
          } else {
            response = result;
          }

          console.log(result);

          MANAGER.value.sendResponse({"type": REQUESTS.MONITORPERMISSION, message: response});
          chrome.runtime.sendMessage({"type": "minimize"});
        });
  }, 500);
}

//The message present on the assistant page UI
const updateMessage = ref("")

/**
 * Stop any active webRTC tracks, remove the follower details from chrome storage, remove the block DIV if it exists
 * then close the window.
 */
const endSession = (notification: string) => {
  webRTCPinia.stopTracks(followerData.uuid);
  chrome.runtime.sendMessage({ "type": "maximize" });

  MANAGER.value.disconnectFollower();
  MANAGER.value.disconnect();

  chrome.runtime.sendMessage({type: REQUESTS.SCREENCONTROL, action: "unblock"})
      .then(result => console.log(result));

  removeSyncStorage("follower")
      .then(() => console.log("Follower data removed"));

  removeSyncStorage("tasks")
      .then(() => console.log("Task data removed"));

  let count = 3;
  let countDown = setInterval(() => {
    updateMessage.value = `${notification}, window closing in ${count} seconds.`

    count--;
    if (count < 0) {
      clearInterval(countDown);
      closeAssistant()
    }
  }, 1000);
}

const closeAssistant = () => {
  chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([tab]) => {
    if (tab && tab.id) {
      chrome.tabs.remove(tab.id);
    }
  });
}

const minimise = () => {
  chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([tab]) => {
    if (tab && tab.windowId) {
      chrome.windows.update(tab.windowId, { state: 'minimized' });
    }
  });
}

</script>

<template>
  <div id="assistant" class="font-poppins h-screen flex flex-col">
    <div class="bg-white w-full px-5 py-5">
      <img class="" src="@/assets/img/icon-popup-header.svg" alt="LeadMe Icon"/>
    </div>
    <div class="bg-blue-100 flex flex-col justify-center items-center px-10 sm:px-32 py-8 h-full">
      <img class="w-32 xs:w-48" src="@/assets/img/happy_col.png" alt="Computer Icon"/>
      <p v-if="!updateMessage" class="max-w-sm text-xl text-center mt-5 mb-10">Don't close me! I need to stay open for <span class="font-semibold">LeadMe Classroom</span> to maintain a connection.</p>
      <p v-else class="text-xl mt-5 mb-10">{{ updateMessage }}</p>
      <button
          class="bg-blue-500 text-white rounded-full px-10 py-3 text-lg shadow hover:bg-blue-400"
          @click="minimise"
      >Minimise me</button>
    </div>
  </div>
</template>
