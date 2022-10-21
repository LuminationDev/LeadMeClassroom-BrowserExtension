<script setup>
import StudentPermission from "@/components/Student/StudentPermission.vue";

import { usePopupStore } from "@/stores/popupStore.ts";
let popupPinia = usePopupStore();
</script>

<template>
  <div class="mt-9 mb-6">
    <StudentPermission>
      <template v-slot:title>
        <p class="text-sm">Storage</p>
      </template>
      <template v-slot:content>
        <p class="text-xsm text-gray-popup-text">
          Grants access to the browsers local and
          synchronised storage. It can directly access
          data that is saved within a browsers storage.
        </p>
      </template>
    </StudentPermission>

    <hr class="my-3"/>

    <StudentPermission>
      <template v-slot:title>
        <p class="text-sm">Tabs</p>
      </template>
      <template v-slot:content>
        <p class="text-xsm text-gray-popup-text">
          Grants access to privileged fields within
          an active or inactive opened Tab.
        </p>
      </template>
    </StudentPermission>

    <hr class="my-3"/>

    <StudentPermission>
      <template v-slot:title>
        <p class="text-sm">Scripting</p>
      </template>
      <template v-slot:content>
        <p class="text-xsm text-gray-popup-text">
          Grants the ability for the extension to
          inject JavaScript and CSS into websites.
        </p>
      </template>
    </StudentPermission>

    <hr class="my-3"/>

    <StudentPermission>
      <template v-slot:title>
        <p class="text-sm">Active Tab</p>
      </template>
      <template v-slot:content>
        <p class="text-xsm text-gray-popup-text">
          Grants a Leader temporary control access
          to a currently active tab. Access to the
          tab lasts while the follower is logged
          into the extension.
        </p>
      </template>
    </StudentPermission>

    <hr class="my-3"/>

    <StudentPermission>
      <template v-slot:title>
        <p class="text-sm">Identity</p>
      </template>
      <template v-slot:content>
        <p class="text-xsm text-gray-popup-text">
          Grants the ability to access saved OAuth2
          access tokens
        </p>
      </template>
    </StudentPermission>
  </div>
</template>
