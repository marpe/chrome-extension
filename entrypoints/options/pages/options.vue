<script lang="ts"
        setup>
import { useAppStore } from "@/stores/app.store";
import { Scripting, Tabs } from "wxt/browser";
import { timestamp } from "@vueuse/core";

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
  while (store.injectedCSS.length) {
    store.injectedCSS.pop();
  }
};

const queryTabs = async () => {
  try {
    const allTabs = await browser.tabs.query({});
    console.log("All tabs", allTabs);
    currentTabs.value = allTabs;
  } catch (e) {
    console.error(e);
  }
};

const executeScript = async () => {
  await queryTabs();

  const tabs = currentTabs.value ?? [];

  await Promise.all(
      tabs.map((tab) => {
        if (!tab.id) {
          return Promise.resolve();
        }
        return browser.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            console.log("Hello from the page");
          },
        });
      }),
  );

  console.log("Script executed");
};

const tryRemoveCSS = async (injection: CSSInjection) => {
  try {
    await browser.scripting.removeCSS(injection);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

const removeInjectedCSS = async () => {
  try {
    const cssInjections = store.injectedCSS;
    await Promise.all(cssInjections.map(tryRemoveCSS));
    clearInjections();
  } catch (e) {
    console.error(e);
  }
};

const tryInjectCSS = async (injection: CSSInjection) => {
  try {
    await browser.scripting.insertCSS(injection);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

const injectCSS = async () => {
  try {
    await removeInjectedCSS();
    await queryTabs();
    const tabs = currentTabs.value ?? [];
    const cssInjections = tabs
        .filter((tab) => tab.id !== undefined)
        .map(({ id }) => {
          return {
            css: style.value,
            target: {
              tabId: id,
            },
          } as CSSInjection;
        });
    const injectionResults = await Promise.all(cssInjections.map(tryInjectCSS));

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

    store.injectedCSS.push(...successfulInjections);
  } catch (e) {
    console.error(e);
  }
};

const showDebug = ref(false);
const toggleShowDebug = () => {
  showDebug.value = !showDebug.value;
};

const initialScript = `
var printHello = () => { console.log('Hello from the script'); };
printHello();
`;
const initialStyle = `
body {
  background-color: red;
}
`;

const style = ref(initialStyle);
const script = ref(initialScript);

const styleChanged = useLastChanged(style, { initialValue: timestamp() });
const scriptChanged = useLastChanged(script, { initialValue: timestamp() });

const styleChangedAgo = useTimeAgo(styleChanged);
const scriptChangedAgo = useTimeAgo(scriptChanged);

const addEntry = () => {
  store.entries.push({
    description: '',
    timestamp: Date.now(),
    style: style.value,
    script: script.value,
  });
};
const save = () => {
  store.stored = {
    theme: store.theme,
    installed: store.installed,
    modified: Date.now(),
    entries: store.entries,
    injectedCSS: store.injectedCSS,
  };
}

onMounted(() => {
  store.loadFromStorage();
});

const selectedEntry = ref<number[]>([]);

const styleSettings = ref({
  value: initialStyle,
  setValue: (value: string) => {},
})

const scriptSettings = ref({
  value: initialScript,
  setValue: (value: string) => {},
});

watch(selectedEntry, (newVal) => {
  if (newVal.length === 0) {
    return;
  }
  const entry = store.entries[newVal[0]];
  styleSettings.value.setValue(entry.style);
  scriptSettings.value.setValue(entry.script);
});

</script>

<template>
  <div>
    <section>
      <div class="flex flex-row gap-4">
        <div>InjectedCSS Entries: {{ store.injectedCSS.length }}</div>
        <div>{{ store.loaded ? "👍" : "👎" }}</div>
        <div>{{ store.installed }}</div>
        <div>{{ store.modified }}</div>
        <div>{{ selectedEntry }}</div>
      </div>

      <div class="flex flex-row gap-4">
        <button @click="addEntry">
          Add Entry
        </button>
        <button @click="injectCSS">
          Inject CSS
        </button>
        <button :disabled="store.injectedCSS.length === 0"
                @click="removeInjectedCSS">
          Remove CSS
        </button>
        <button @click="executeScript">
          Execute Script
        </button>
      </div>
    </section>

    <div class="grid grid-cols-[140px_1fr] gap-4">
      <select multiple
              v-model="selectedEntry"
              class="entry-select">
        <option v-for="(entry, index) in store.entries"
                :value="index"
                :key="entry.timestamp">
          {{ useTimeAgo(entry.timestamp) }}
        </option>
      </select>
      <div>
        <div>
          {{ styleChangedAgo }}
        </div>
        <div class="mb-4">
          <MonacoEditor language="css"
                        :settings="styleSettings"
                        v-model="style" />
        </div>
        <div>{{ scriptChangedAgo }}</div>
        <div class="mb-4">
          <MonacoEditor language="typescript"
                        :settings="scriptSettings"
                        v-model="script" />
        </div>
      </div>
    </div>

    <div>
      <button @click="save">
        Save
      </button>
    </div>

    <div
        class="overflow-x-auto border border-blue-500 min-h-4 data-[open=false]:max-h-8 cursor-pointer"
        :data-open="showDebug"
        @click="toggleShowDebug"
    >
      <Debug>
        {{ JSON.stringify(store.injectedCSS, null, 2) }}
      </Debug>
    </div>
  </div>
</template>

<style>
.entry-select {
  background-color: var(--surface-4);
}
</style>