<script lang="ts" setup>
import type { Scripting, Tabs } from "wxt/browser";
import { useAppStore } from "@/stores/app.store";
type CSSInjection = Scripting.CSSInjection;

const store = useAppStore();
const currentTabs = ref<Tabs.Tab[]>();

/* const injectStyle = async () => {
  const style = document.createElement("style");
  style.innerHTML = store.script;
  document.head.appendChild(style);
  alert(`Style injected: ${JSON.stringify(store.script)}`);
}; */

const clearInjections = () => {
  while (store.injectedCss.length) {
    store.injectedCss.pop();
  }
}

const queryTabs = async () => {
  try {
    const allTabs = await browser.tabs.query({});
    console.log("All tabs", allTabs);
    currentTabs.value = allTabs;
  }
  catch (e) {
    console.error(e);
  }
}

const executeScript = async () => {
  await queryTabs();
 
  const tabs = currentTabs.value ?? [];
  
  await Promise.all(tabs.map(tab => {
    if (!tab.id) {
      return Promise.resolve();
    };
    return browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        console.log("Hello from the page");
      }
    });
  }));

  console.log("Script executed");
}

const tryRemoveCss = async (injection: CSSInjection) => {
  try {
    await browser.scripting.removeCSS(injection)
    return true;
  }
  catch (e) {
    console.error(e);
    return false;
  }
};

const removeInjectedCss = async () => {
  try {
    const cssInjections = store.injectedCss;
    await Promise.all(cssInjections.map(tryRemoveCss));
    clearInjections();
  }
  catch (e) {
    console.error(e);
  }
}


const tryInjectCss = async (injection: CSSInjection) => {
  try {
    await browser.scripting.insertCSS(injection);
    return true;
  }
  catch (e) {
    console.error(e);
    return false;
  }
}

const injectCss = async () => {
  try {
    await removeInjectedCss();
    await queryTabs();
    const tabs = currentTabs.value ?? [];
    const cssInjections = tabs.filter(tab => tab.id !== undefined).map(({ id }) => {
      return {
        css: store.script,
        target: {
          tabId: id
        },
      } as CSSInjection;
    });
    const injectionResults = await Promise.all(cssInjections.map(tryInjectCss));

    const successfulInjections: CSSInjection[] = [];
    const failedInjections: CSSInjection[] = [];

    for (let i = 0; i < injectionResults.length; i++) {
      if (!injectionResults[i]) {
        failedInjections.push(cssInjections[i]);
      } else {
        successfulInjections.push(cssInjections[i]);
      }
    }

    console.log("Injections", { successfulInjections, failedInjections });

    store.injectedCss.push(...successfulInjections);
  }
  catch (e) {
    console.error(e);
  }
}

const showDebug = ref(false);
const toggleShowDebug = () => {
  showDebug.value = !showDebug.value;
}

</script>

<template>
  <div class="grid grid-rows-[1fr_auto] grid-flow-row gap-4 p-6">
    <div>
      <textarea v-model="store.script" class="textarea textarea-bordered textarea-lg text-xs w-full" rows="10" />
    </div>
    <div class="flex flex-col gap-4">
      <!-- <button class="btn btn-primary" @click="store.toggle">
        {{ store.enabled ? "Disable" : "Enable" }}
      </button> -->
      <div>InjectedCSS Entries: {{ store.injectedCss.length }}</div>
      <div class="grid grid-cols-2 gap-4">
        <button class="btn btn-primary" @click="injectCss">
          Inject Style
        </button>
        <button class="btn btn-primary" :disabled="store.injectedCss.length === 0" @click="removeInjectedCss">
          Remove CSS
        </button>
        <button class="btn btn-primary col-span-2" @click="executeScript">
          Execute Script
        </button>
      </div>
    </div>
    <div class="overflow-x-auto border border-blue-500 data-[open=false]:max-h-8 cursor-pointer" :data-open="showDebug" @click="toggleShowDebug">
      <Debug>
        {{ JSON.stringify(currentTabs, null, 2) }}
      </Debug>
    </div>
  </div>
</template>

<style scoped></style>
