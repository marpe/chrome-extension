<script setup
        lang="ts"
>

const close = () => {
  chrome.sidePanel.setOptions({ enabled: false });
};
</script>

<template>
  What is this?
  <button
    class="btn btn-primary"
    @click="close()"
  >
    Close
  </button>
</template>

<style scoped>
</style>
