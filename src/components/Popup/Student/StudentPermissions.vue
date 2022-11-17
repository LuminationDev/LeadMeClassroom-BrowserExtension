<script setup lang="ts">
import StudentPermission from "../../../components/Popup/Student/StudentPermission.vue";
import permissionData from "../../../config/permissions.json";
import { onMounted } from "vue";

import { usePermissionStore } from "../../../stores/permissionStore";
let permissionPinia = usePermissionStore();

const permissionJson = permissionData;

onMounted(() => {
  chrome.permissions.getAll((granted) => {
    permissionJson.forEach(permission => {
      // @ts-ignore
      permissionPinia.permissions[permission.tag] = granted.permissions?.includes(permission.tag);
    });
  });
});
</script>

<template>
  <div class="mt-9 mb-6">

    <div v-for="(permission, index) in permissionJson">
      <StudentPermission
          :name="permission.tag"
          :checked="permissionPinia.permissions[permission.tag]"
          @update="newValue => permissionPinia.setPermission(permission.tag, newValue)">

        <template v-slot:title>
          <p class="text-sm">{{permission.title}}</p>
        </template>
        <template v-slot:content>
          <p class="text-xsm text-gray-popup-text">
            {{permission.description}}
          </p>
        </template>
      </StudentPermission>

      <hr v-if="index !== Object.keys(permissionJson).length - 1" class="my-3"/>
    </div>
  </div>
</template>
