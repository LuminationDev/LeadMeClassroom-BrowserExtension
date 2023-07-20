<script setup lang="ts">
import { usePopupStore } from "../../../stores/popupStore";
import ActionBarQuestion from "../../ActionBar/ActionBarQuestion.vue";
import * as REQUESTS from "../../../constants/_requests";

const popupPinia = usePopupStore();

const isYouTubeLink = (link: string) => {
  const youtubeRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;
  return youtubeRegex.test(link);
}

const isVimeoLink = (link: string) => {
  const vimeoRegex = /^(http(s)?:\/\/)?(www\.)?vimeo\.com\/(\d+)($|\/)/;
  return vimeoRegex.test(link);
}

const favicon = (url: string) => {
  if(isYouTubeLink(url)) {
    url = "www.youtube.com"
  } else if(isVimeoLink(url)) {
    url = "www.vimeo.com"
  }

  return `https://s2.googleusercontent.com/s2/favicons?domain=${url}`;
}

const sendMessageToOpenTab = (url: string) => {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    let activeTab = tabs[0];
    if (activeTab.id == null) { return; }

    chrome.tabs.sendMessage(activeTab.id,
        {
          "type": REQUESTS.POPUPTABCONTROL,
          "url": url
        }
    );
  });
}
</script>

<template>
  <div class="flex flex-col flex-grow">
    <!--No content has been shared-->
    <div v-if="popupPinia.tasks.length === 0" class="flex flex-col flex-grow justify-center items-center">
      <img class="w-24 h-20 mb-5 opacity-50" src="@/assets/img/happy_col.png" alt=""/>
      <p class="text-sm w-40 text-gray-400">No content has been shared yet.</p>
    </div>

    <!--Task list-->
    <div v-else class="flex flex-col flex-grow mx-6">
      <div class="text-xsm text-gray-400 text-left font-semibold mt-4 mb-2">LESSON CONTENT</div>

      <div class="h-36 overflow-y-auto">
        <div v-for="task in popupPinia.tasks" v-on:click="sendMessageToOpenTab(task.getPackageName())"
            class="w-full flex flex-row items-center bg-white rounded p-2 mb-2 cursor-pointer hover:bg-gray-200">

          <img class="h-5 w-5 mr-2" :src="favicon(task.getPackageName())" alt="logo"/>
          <div class="text-ellipsis overflow-hidden whitespace-nowrap">
            {{ task.getName() }}
          </div>
        </div>
      </div>
    </div>

    <ActionBarQuestion />
  </div>
</template>
