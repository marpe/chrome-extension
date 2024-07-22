<script lang="ts" setup>

import { useAppStore } from "@/stores/app.store";

const scriptValue = ref()
const store = useAppStore();

const incremenet = () => {
  store.increment();
  console.log(store.count);
}

</script>

<template>
  <div>
    <div class="bg-blue-500 color-blue-500">
      Hello!
    </div>

    <div class="flex gap-4">
      <div>
        <a href="https://wxt.dev" target="_blank">
          <img src="/vite.svg" class="logo" alt="WXT logo">
        </a>
      </div>
      <div>
        <a href="https://vuejs.org/" target="_blank">
          <img src="/vue.svg" class="logo vue" alt="Vue logo">
        </a>
      </div>
    </div>
    Hello this is popup
    <HelloWorld msg="WXT + Vue" />

    <MessageButtons />

    {{ store.count }}
    <textarea v-model="scriptValue" />
    <button class="btn btn-primary" @click="incremenet">
      Increment
    </button>
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
