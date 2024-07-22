<script lang="ts" setup>

import { useOptionsStore } from "@/stores/options.store";

const scriptValue = ref()

const saveScript = async () => {
  const storedOptions = await useOptionsStore();
  storedScript.setValue(storedOptions)
  alert('Script saved!')
}

onMounted(async () => {
  scriptValue.value = await storedScript.getValue()
})

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
          <img src="@/assets/vue.svg" class="logo vue" alt="Vue logo">
        </a>
      </div>
    </div>
    Hello this is popup
    <HelloWorld msg="WXT + Vue" />

    <MessageButtons />

    <textarea v-model="scriptValue" />
    <button class="btn btn-primary" @click="saveScript">
      Save
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
