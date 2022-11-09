<script setup lang="ts">
import '../../styles.css'
import { onMounted, ref, computed } from 'vue'
import { ConnectionManager } from '../../controller'
import * as REQUESTS from '../../constants/_requests.js'
import Tab from "../../models/_tab";
import Follower from "../../models/_follower";

const assistantListener = (data: any) => {
  if (data == null) {
    return;
  }

  console.log(data);

  switch (data.type) {
    case REQUESTS.MONITORPERMISSION:
      monitorRequest();
      break;

    case "ice":
      console.log("ice");
      if (MANAGER.value.webRTC) {
        MANAGER.value.webRTC.readIceCandidate(data);
      }
      break;

    case REQUESTS.MONITORENDED:
      console.log(MANAGER)
      if (MANAGER.value.webRTC) {
        MANAGER.value.webRTC.stopFollowerStream();
      }
      break;

    case REQUESTS.CAPTURE:
      console.log("Updating screenshot");
      MANAGER.value.captureScreen();
      break;

    case REQUESTS.UPDATE_TAB:
      MANAGER.value.updateTab(data.tab)
      break;

    case REQUESTS.UPDATE_ACTIVE_TAB:
      MANAGER.value.updateActiveTab(data.tabId)
      break;

    case REQUESTS.REMOVE_TAB:
      MANAGER.value.removeTab(data.tabId)
      break;

    case REQUESTS.DELETE_TAB:
      MANAGER.value.deleteTab(data.tabId)
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
    function (request, sender, sendResponse) {
      console.log(request);
      if (sender?.tab?.url?.includes("assistant.html")) {
        return;
      }
      assistantListener(request);
      return true;
    }
);

//Persistent connection to Firebase & WebRTC
const MANAGER = ref(new ConnectionManager(assistantListener));

//Start the connection manager on page load
chrome.storage.sync.get("follower", async (data) => {
  let f = new Follower(data.follower.code, data.follower.name)
  chrome.tabs.query({}, (tabs) => {
    const tabsArr: Tab[] = tabs.map(tab => {
      return new Tab(tab.id + "", tab.title ?? "", tab.favIconUrl ?? "", tab.url ?? "")
    })
    f.tabs = tabsArr
    MANAGER.value.connect(f);
  })
});

const monitorRequest = () => {
  console.log("Leader has asked follower for permission");
  chrome.runtime.sendMessage({ "type": "maximize" });
  setTimeout(() => {
    if (!MANAGER.value.webRTC) {
      return
    }
    MANAGER.value.webRTC.prepareScreen()
        .then((result) => {
          console.log(result);
          MANAGER.value.sendResponse({ "type": REQUESTS.MONITORPERMISSION, message: result });
          chrome.runtime.sendMessage({ "type": "minimize" });
        });
  }, 500);
}

/**
 * Remove the follower details from chrome storage then close the window. The
 * window.open("", "_self") does nothing except give JavaScript ownership over
 * the window allowing it to be closed programmically.
 */
const endSession = () => {
  MANAGER.value.disconnectFollower();
  MANAGER.value.disconnect();

  chrome.storage.sync.remove("follower", () => {
    console.log("Data removed");
  });

  closeAssistant()
}

let updateMessage = ref("")

/**
 * Print a message to the assistant page that the Leader has ended the current
 * session.
 */
const sessionEndedByLeader = () => {
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
      <p v-if="!updateMessage" class="text-xl mt-5 mb-10">Don't close me! I need to stay open for <b>LeadMe Classroom</b> to maintain a connection.</p>
      <p v-else class="text-xl mt-5 mb-10">{{ updateMessage }}</p>
      <button
          class="bg-blue-400 text-white rounded-full px-10 py-3 text-lg shadow"
          @click="minimise"
      >Minimise me</button>
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
