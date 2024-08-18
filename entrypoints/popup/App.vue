<script lang="ts"
        setup>
import Options from "@/entrypoints/options/pages/options.vue";
</script>

<template>
  <strong>
    Popup - <a @click="() => browser.runtime.openOptionsPage()">Open Options</a>
  </strong>
  <Options />
</template>

<style>
body {
  width: 800px;
  height: 600px;
}
</style>
