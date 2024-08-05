<script lang="ts" setup>
import Options from "@/entrypoints/options/pages/options.vue";
</script>

<template>
  <div class="navbar bg-neutral text-neutral-content">
    <div class="px-4">
      Popup
    </div>
  </div>
  <RouterView>
    <Options />
  </RouterView>
</template>

<style>
body {
  overflow-x: clip;
}
</style>
