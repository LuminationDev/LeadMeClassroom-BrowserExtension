<script setup lang="ts">
import '../../styles.css'
import { onMounted, ref, computed } from 'vue'

const permissions = ref({
  storage: false,
  tabs: false,
  scripting: false,
  activeTab: false,
  identity: false
})

const storage = computed({
  get() {
    return permissions.value.storage
  },

  set(newValue) {
    if (newValue) {
      enablePermission("storage")
    } else {
      removePermission("storage")
    }
    permissions.value.storage = newValue
  }
})

const tabs = computed({
  get() {
    return permissions.value.tabs
  },

  set(newValue) {
    if (newValue) {
      enablePermission("tabs")
    } else {
      removePermission("tabs")
    }
    permissions.value.tabs = newValue
  }
})

const scripting = computed({
  get() {
    return permissions.value.scripting
  },

  set(newValue) {
    if (newValue) {
      enablePermission("scripting")
    } else {
      removePermission("scripting")
    }
    permissions.value.scripting = newValue
  }
})

const activeTab = computed({
  get() {
    return permissions.value.activeTab
  },

  set(newValue) {
    if (newValue) {
      enablePermission("activeTab")
    } else {
      removePermission("activeTab")
    }
    permissions.value.activeTab = newValue
  }
})

const identity = computed({
  get() {
    return permissions.value.identity
  },

  set(newValue) {
    if (newValue) {
      enablePermission("identity")
    } else {
      removePermission("identity")
    }
    permissions.value.identity = newValue
  }
})

onMounted(() => {
  chrome.permissions.getAll((granted) => {
    console.log(granted)
    permissions.value.storage = granted.permissions?.includes("storage")
    permissions.value.tabs = granted.permissions?.includes("tabs")
    permissions.value.scripting = granted.permissions?.includes("scripting")
    permissions.value.activeTab = granted.permissions?.includes("activeTab")
    permissions.value.identity = granted.permissions?.includes("identity")
  });
})

/**
 * Disable a permission within the extension, this will remain disables until
 * it is either requested by the extension or manually re-enabled.
 * @param {*} id
 */
function removePermission(name: string) {
  chrome.permissions.remove({
    permissions: [name],
  });
}

/**
 * Enable a permission within the extension, this will remain enabled until
 * it is manually disabled or the extension is uninstall.
 * @param {*} target The element that has been triggered
 */
function enablePermission(name: string) {
  chrome.permissions.request({
    permissions: [name],
  }, (granted) => {
    if (!granted) {
      permissions.value[name] = false
    }
  });
}


</script>

<template>
  <div id="options">
    <h1>Options Page</h1>
  </div>

  <div id="permissions">
    <hr>
    <div class="permissionHolder">
      <h2>Storage</h2>
      <label class="switch">
        <input name="permissionChange" id="storage" type="checkbox" v-model="storage">
        <span class="slider round"></span>
      </label>
    </div>

    <p class="description">Grants access to the browsers local and synchronised storage. It can directly access data
      that is saved within a browsers storage.</p>

    <hr>
    <div class="permissionHolder">
      <h2>Tabs</h2>
      <label class="switch">
        <input name="permissionChange" id="tabs" type="checkbox" v-model="tabs">
        <span class="slider round"></span>
      </label>
    </div>

    <p class="description">Grants access to privileged fields within an active or inactive opened Tab.</p>


    <hr>
    <div class="permissionHolder">
      <h2>Scripting</h2>
      <label class="switch">
        <input name="permissionChange" id="scripting" type="checkbox" v-model="scripting">
        <span class="slider round"></span>
      </label>
    </div>

    <p class="description">Grants the ability for the extension to inject JavaScript and CSS into websites.</p>

    <hr>
    <div class="permissionHolder">
      <h2>Active Tab</h2>
      <label class="switch">
        <input name="permissionChange" id="activeTab" type="checkbox" v-model="activeTab">
        <span class="slider round"></span>
      </label>
    </div>

    <p class="description">Grants a Leader temporary control access to a currently active tab. Access to the tab lasts
      while the follower is logged into the extension.</p>

    <hr>
    <div class="permissionHolder">
      <h2>Identity</h2>
      <label class="switch">
        <input name="permissionChange" id="identity" type="checkbox" v-model="identity">
        <span class="slider round"></span>
      </label>
    </div>

    <p class="description">Grants the ability to access saved OAuth2 access tokens.</p>

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
