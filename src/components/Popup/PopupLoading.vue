<script setup lang="ts">

</script>

<template>
  <div class="mt-9">
    <div class="h-56 flex flex-col items-center">
      <p class="pt-6 lds-dual-ring-lg" />
    </div>
  </div>
</template>

<style>
.lds-dual-ring-lg {
  display: inline-block;
  width: 150px;
  height: 150px;
}
.lds-dual-ring-lg:after {
  content: " ";
  display: block;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 2px solid #182B50;
  border-color: #182B50 transparent #182B50 transparent;
  animation: lds-dual-ring-lg 1.2s linear infinite;
}
@keyframes lds-dual-ring-lg {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>