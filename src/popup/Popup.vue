<script setup lang="ts">
import ThePopup from "@/components/Popup/ThePopup.vue";
import '@/styles.css';

// import { onMounted, ref } from 'vue'
// import { auth } from 'firebaseui';
// import { getAuth, setPersistence, browserLocalPersistence, signOut, EmailAuthProvider } from '@firebase/auth'
// import { Firebase } from "@/controller";
// import * as REQUESTS from "@/constants/_requests";

// const firebase = new Firebase();

// const showPopup = ref(false)
// const form = ref(null)
// const login = ref(null)
// const loginLoaded = ref(false)
// const errorMessage = ref("")
// const loginText = ref("Login")
// const inputValues = ref({
//   input1: "",
//   input2: "",
//   input3: "",
//   input4: ""
// })

// onMounted(() => {
//   chrome.permissions.contains({
//     permissions: ["storage"]
//   }, (granted) => {
//     if (granted) {
//       checkForFollower();
//     } else {
//       console.log("Storage permission is not enabled.");
//     }
//   });
//
//   setPersistence(getAuth(), browserLocalPersistence).then(() => {
//     if (getAuth().currentUser) {
//       loginText.value = "Go to dashboard"
//     } else {
//       loginText.value = "Login"
//     }
//   })
// })

// function handleLogoutClick() {
//   signOut(getAuth()).then(() => {
//     loginText.value = "Login"
//   })
// }

// function handleLoginClick() {
//   if (getAuth().currentUser) {
//     chrome.tabs.create({ url: chrome.runtime.getURL("src/pages/dashboard/dashboard.html") });
//   } else {
//     var ui = new auth.AuthUI(getAuth())
//     ui.start('#firebaseui-auth-container', {
//       signInOptions: [
//         EmailAuthProvider.PROVIDER_ID
//       ],
//       callbacks: {
//         signInFailure(error) {
//           errorMessage.value = error
//           return false;
//         },
//         signInSuccessWithAuthResult(authResult, redirectUrl) {
//           chrome.tabs.create({ url: chrome.runtime.getURL("src/pages/dashboard/dashboard.html") });
//           return false;
//         }
//       }
//     });
//   }
// }

// function handleAssistantClick() {
//   chrome.runtime.sendMessage({ "type": "maximize" });
// }

// function handleEndSessionClick() {
//   chrome.storage.sync.get("follower", (data) => {
//     if (data.follower != null && data.follower != undefined) {
//       //Send message to firebase about disconnection
//       chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {

//         var activeTab = tabs[0];
//         chrome.tabs.sendMessage(activeTab.id,
//           {
//             "type": "disconnect",
//             "code": data.follower.code,
//             "uuid": data.follower.uuid
//           }, (response) => {
//             console.log(response);
//           }
//         );
//       });
//     }
//   });

//   chrome.storage.sync.remove("follower", () => {
//     console.log("Data removed");
//   });

//   chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([tab]) => {
//     if (tab) {
//       chrome.tabs.remove(tab.id);
//     }
//   });
// }

// function checkForFollower() {
//   chrome.storage.sync.get("follower", (data) => {
//     console.log(data)
//     if (data.follower != null && data.follower != undefined) {
//       showPopup.value = false
//     } else {
//       showPopup.value = true
//     }
//   });
// }

// function reset() {
//   form.value.reset()
// }

// function handleInput() {
//   // todo
//   /*
//   inputs.forEach((input, key) => {
//     input.addEventListener('keyup', function (e) {
//         if (e.key === "Backspace") {
//             if (key === 3) {
//                 codeBlock.classList.add('hidden');
//             }

//             if (key != 0) {
//                 inputs[key - 1].focus();
//             }
//         }

//         if (key === 3 && e.key === "Enter") {
//             connect.click();
//         }

//         if (input.value) {
//             if (key === 3) {
//                 codeBlock.classList.remove('hidden');
//             } else {
//                 inputs[key + 1].focus();
//             }
//         }
//     });
// });
//    */
// }

// function connect() {
//   chrome.permissions.request({
//     permissions: [
//       "storage",
//       "tabs",
//       "scripting",
//       "activeTab",
//       "identity"
//     ]
//   }, (granted: boolean) => {
//     console.log(granted);
//
//     // The callback argument will be true if the user granted the permissions.
//     if (granted) {
//       console.log("Permissions have been enabled");
//       connectToClass();
//     } else {
//       console.log("Permissions have been denied");
//       errorMessage.value = "Permissions have been denied"
//     }
//   });
// }

// function openOptionsPage() {
//   chrome.runtime.openOptionsPage()
// }
//
// function connectToClass() {
//   const userCode = inputValues.value.input1 + inputValues.value.input2 + inputValues.value.input3 + inputValues.value.input4
//   console.log(userCode)
//   console.log(inputValues)
//
//   //Querys the currently open tab and sends a message to it
//   chrome.tabs.query({ currentWindow: true, active: true }, function (tabs: any) {
//     firebase.checkForClassroom(userCode).then((result) => {
//       if (result) {
//         chrome.storage.sync.set({
//           "follower":
//           {
//             "code": userCode
//           }
//         });
//
//         chrome.windows.create({
//           url: chrome.runtime.getURL("src/pages/assistant/assistant.html"),
//           type: "popup",
//           state: "minimized"
//         });
//
//         window.close();
//       }
//     });
//   });
// }


</script>

<template>
  <ThePopup />
  <!-- <div id="popup" v-if="showPopup">
    <h1 class="text-3xl">Popup Page</h1>
    <h3>Please enter your class code</h3>

    <form ref="form" class="flex justify-center">
      <input v-model="inputValues.input1" class="bg-gray-500" maxlength="1" @keyup="handleInput" />
      <input v-model="inputValues.input2" class="bg-gray-500 mx-2" maxlength="1" @keyup="handleInput" />
      <input v-model="inputValues.input3" class="bg-gray-500 mx-2" maxlength="1" @keyup="handleInput" />
      <input v-model="inputValues.input4" class="bg-gray-500" maxlength="1" @keyup="handleInput" />
    </form>

    <div id="code-block" class="special">
      <button id="connectBtn" @click="connect">Connect</button>
      <br />
      <i @click="reset" id="resetCode">Reset </i>
    </div>

    <p id="error">{{ errorMessage }}</p>

    <button ref="login" @click="handleLoginClick">{{ loginText }}</button>
    <button id="logout" @click="handleLogoutClick">Logout </button>
    <div id="firebaseui-auth-container" class="firebase-auth"></div>
  </div>

  If there is a saved class code
  <div v-else>
    <button id="assistantBtn" @click="handleAssistantClick">Assistant</button>
    <button id="endSessionBtn" @click="handleEndSessionClick">End Session</button>
  </div>
  <button id="openOptions" @click="openOptionsPage">Options</button> -->
</template>

<!-- <style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style> -->
