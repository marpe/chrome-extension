<script lang="ts" setup>
import  Options  from "@/entrypoints/options/pages/options.vue";
</script>

<template>
  <div>
    <div class="bg-blue-500 color-blue-500">
      Popup
    </div>
    <RouterView>
      <Options />
    </RouterView>
  </div>
</template>

<style scoped>
body {
  height: 400px;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #54bc4ae0);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
