<script setup lang="ts">
import GenericButton from "../../../components/Buttons/GenericButton.vue";
</script>

<template>
  <div class="my-8 px-8 overflow-y-scroll h-full">
    <div class="sticky top-0 w-full py-4 bg-panel-background">
      <slot name="header">
        <h1 class="text-xl font-medium">Lesson Plans</h1>
        <div class="mt-8">
          <router-link to="create-lesson">
            <GenericButton type="primary" :callback="() => { }">
              <div class="flex flex-row justify-center">
                <img src="../../assets/external_link.svg" alt="icon representing link" class="mr-2"/>
                <span class="font-medium">New lesson plan</span>
              </div>
            </GenericButton>
          </router-link>
        </div>
      </slot>
    </div>
    <slot></slot>
  </div>

</template>