<script setup lang="ts">
import '../../styles.css'
import {ref} from 'vue'
import {ConnectionManager} from '../../controller'
import * as REQUESTS from '../../constants/_requests.js'
import Tab from "../../models/_tab";
import Follower from "../../models/_follower";

import {useWebRTCStore} from "../../stores/webRTCStore";
const webRTCPinia = useWebRTCStore();

const assistantListener = (data: any) => {
  if (data == null) { return; }

  console.log(data);

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
      removedByLeader();
      break;

    case REQUESTS.ENDSESSION:
      sessionEndedByLeader();
      break;

    case REQUESTS.YOUTUBE:
    case REQUESTS.SCREENCONTROL:
    case REQUESTS.MUTETAB:
    case REQUESTS.UNMUTETAB:
    case REQUESTS.WEBSITE:
      chrome.runtime.sendMessage(data);
      break;

    default:
      console.log("Unknown command");
      break;
  }
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
  let f = new Follower(data.follower.code, data.follower.name)
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
        .then((result: string|undefined) => {
          MANAGER.value.sendResponse({"type": REQUESTS.MONITORPERMISSION, message: result});
          chrome.runtime.sendMessage({"type": "minimize"});
        });
  }, 500);
}

const updateMessage = ref("")

/**
 * The leader has removed this follower from the class.
 */
const removedByLeader = () => {
  webRTCPinia.stopTracks(followerData.uuid);
  chrome.runtime.sendMessage({ "type": "maximize" });

  //Disconnect the user first
  MANAGER.value.disconnectFollower();
  MANAGER.value.disconnect();

  chrome.storage.sync.remove("follower", () => {
    console.log("Data removed");
  });

  let count = 3;
  let countDown = setInterval(() => {
    updateMessage.value = `Leader has removed you from the session, window closing in ${count} seconds.`

    count--;
    if (count < 0) {
      clearInterval(countDown);
      closeAssistant()
    }
  }, 1000);
}

/**
 * Print a message to the assistant page that the Leader has ended the current
 * session.
 */
const sessionEndedByLeader = () => {
  webRTCPinia.stopTracks(followerData.uuid);
  chrome.runtime.sendMessage({ "type": "maximize" });

  let count = 5;
  let countDown = setInterval(() => {
    updateMessage.value = `Leader has ended session, window closing in ${count} seconds.`

    count--;
    if (count < 0) {
      clearInterval(countDown);
      endSession();
    }
  }, 1000);
}

/**
 * Remove the follower details from chrome storage then close the window. The
 * window.open("", "_self") does nothing except give JavaScript ownership over
 * the window allowing it to be closed programmatically.
 */
const endSession = () => {
  MANAGER.value.disconnectFollower();
  MANAGER.value.disconnect();

  chrome.storage.sync.remove("follower", () => {
    console.log("Data removed");
  });

  closeAssistant();
}

const closeAssistant = () => {
  chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([tab]) => {
    if (tab && tab.id) {
      chrome.tabs.remove(tab.id);
    }
  });
}

function minimise() {
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
