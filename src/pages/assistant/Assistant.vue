<script setup lang="ts">
import '../../styles.css'
import { onMounted, ref, computed } from 'vue'
import { ConnectionManager } from '../../controller'
import * as REQUESTS from '../../constants/_requests.js'
import Tab from "../../models/_tab";
import Follower from "../../models/_follower";

const assistantListener = (data) => {
  if (data == null) {
    return;
  }

  console.log(data);

  switch (data.type) {
    case REQUESTS.MONITORPERMISSION:
      monitorRequest();
      break;

    case REQUESTS.MONITORENDED:
      console.log(MANAGER)
      MANAGER.value.webRTC.stopStream();
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
      if (sender.tab && sender.tab.url.contains("assistant.html")) {
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
    const tabsArr = tabs.map(tab => {
      return new Tab(tab.id + "", tab.title, tab.favIconUrl ?? "", tab.url)
    })
    const tabsKeyValue = {}
    tabsArr.forEach(tab => {
      tabsKeyValue[tab.id] = tab
    })
    f.tabs = tabsKeyValue
    MANAGER.value.connect(f);
  })
});

const monitorRequest = () => {
  console.log("Leader has asked follower for permission");
  chrome.runtime.sendMessage({ "type": "maximize" });
  setTimeout(() => {
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

/**
 * Print a message to the assistant page that the Leader has ended the current
 * session.
 */
const sessionEndedByLeader = () => {
  chrome.runtime.sendMessage({ "type": "maximize" });

  let count = 5;

  let countDown = setInterval(() => {
    document.getElementById("updateMessage").innerHTML = `Leader has ended session, window closing in ${count} seconds.`

    count--;
    if (count < 0) {
      clearInterval(countDown);
      endSession();
    }
  }, 1000);
}

 const closeAssistant = () => {
  chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([tab]) => {
    if (tab) {
      chrome.tabs.remove(tab.id);
    }
  });
}

</script>

<template>
  <div id="assistant">
    <h1>Assistant</h1>
    <p>src\pages\assistant\assistant.html</p>
    <p>Don't close me, I'm here for a persistant connection!</p>

    <p id="updateMessage"></p>

    <button id="endSessionBtn" @click="endSession">End Session</button>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
