<script lang="ts"
        setup>
import { useAppStore } from "@/stores/app.store";
import { Scripting, Tabs } from "wxt/browser";
import { timestamp } from "@vueuse/core";
import type { Entry } from "@/types/entry";
import { nanoid } from "nanoid";
import { onMounted } from "vue";

type CSSInjection = Scripting.CSSInjection;

const {
  isRevealed,
  reveal,
  confirm,
  cancel,
} = useConfirmDialog()
const store = useAppStore();
const currentTabs = ref<Tabs.Tab[]>();

/* const injectStyle = async () => {
  const style = document.createElement("style");
  style.innerHTML = store.script;
  document.head.appendChild(style);
  alert(`Style injected: ${JSON.stringify(store.script)}`);
}; */

const clearInjections = () => {
  while (store.stored.injectedCSS.length) {
    store.stored.injectedCSS.pop();
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
            store.stored.entries.map((entry) => {
              try {
                eval(entry.script);
              } catch (error) {
                console.error(`Error executing script: ${error}`, { error, tab, entry });
              }
            });
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
    const cssInjections = store.stored.injectedCSS;
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
    console.error(`Error injecting CSS: ${e}`, { e, injection });
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
            css: store.stored.entries.map((entry) => entry.style).join("\n"),
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

    store.stored.injectedCSS.push(...successfulInjections);
  } catch (e) {
    console.error(e);
  }
};

const showDebug = ref(false);
const toggleShowDebug = () => {
  showDebug.value = !showDebug.value;
};

const initialStyle = `body {
  background-color: red;
}`;

const initialScript = `var printHello = () => { console.log('Hello from the script'); };
printHello();`;

const styleValue = ref({ value: "" });
const scriptValue = ref({ value: "" });


// const styleChanged = useLastChanged(style, { initialValue: timestamp() });
// const scriptChanged = useLastChanged(script, { initialValue: timestamp() });

// const styleChangedAgo = useTimeAgo(styleChanged);
// const scriptChangedAgo = useTimeAgo(scriptChanged);

const addEntry = () => {
  const id = nanoid();
  store.stored.entries.push({
    id: id,
    description: `New entry`,
    created: Date.now(),
    modified: Date.now(),
    style: initialStyle,
    script: initialScript,
    revision: 1,
  });
  console.log(`Added entry, number of entries: ${store.stored.entries.length}`);
  store.stored.selectedIndex = store.stored.entries.length - 1;
};

const save = () => {
  dirty.value = false;
  store.stored.saved = Date.now();
}

const dirty = ref(false);
const disabled = ref(true);

const selectEntry = (index: number) => {
  if (index === -1) {
    selectedEntry.value = {
      id: '',
      description: '',
      created: Date.now(),
      modified: Date.now(),
      style: '',
      script: '',
      revision: 1,
    }
    styleValue.value = { value: "" }
    scriptValue.value = { value: "" }
    disabled.value = true;
    return;
  }
  const entry = store.stored.entries[index];
  selectedEntry.value = entry;
  styleValue.value = { value: entry.style };
  scriptValue.value = { value: entry.script };
  disabled.value = false;
}

watch(() => store.stored.selectedIndex, (newVal, oldVal) => {
  /*if (dirty.value) {
    const { data, isCanceled } = await reveal()
    if (!isCanceled) {
      console.log(data)
    }
  }*/
  selectEntry(newVal);
});

const selectedEntry = ref<Entry>({
  id: '',
  description: '',
  created: Date.now(),
  modified: Date.now(),
  style: '',
  script: '',
  revision: 1,
});

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const removeEntry = (index: number) => {
  store.stored.entries.splice(index, 1);

  const clamped = clamp(store.stored.selectedIndex, 0, store.stored.entries.length - 1);
  if (clamped !== store.stored.selectedIndex) {
    store.stored.selectedIndex = clamped;
  }
  console.log(`Removed entry, number of entries: ${store.stored.entries.length}`);
}

const removeSelected = () => {
  const index = store.stored.selectedIndex;
  if (index === -1) {
    return;
  }
  removeEntry(index);
};

watch(() => store.loaded, (newVal) => {
  if (newVal) {
    selectEntry(store.stored.selectedIndex);
    console.log("Loaded");
  }
});

</script>

<template>
  <main>
    <template v-if="store.loaded">

      <div class="grid grid-cols-[200px_1fr] gap-4 flex-1 overflow-hidden">
        <div class="flex flex-col gap-4 overflow-y-auto">
          <div class="grid grid-cols-2 gap-4">
            <button @click="addEntry"
                    class="btn-primary">
              <i-lucide-circle-plus />
            </button>
            <button @click="removeSelected"
                    :disabled="disabled"
                    class="btn-primary">
              <i-lucide-circle-minus />
            </button>
          </div>
          <div class="entry-list">
            <TransitionGroup>
              <div v-for="(entry, index) in store.stored.entries"
                   :key="index"
                   @click="store.stored.selectedIndex = index"
                   :class="{ checked: store.stored.selectedIndex === index }"
                   class="flex flex-col gap-2 entry-button">
                <div class="flex flex-row justify-between items-center">
                  <div>{{ entry.description }}</div>
                  <button class="remove btn-unstyled"
                          @click.stop="removeEntry(index)">
                    <i-lucide-x class="size-4" />
                  </button>
                </div>
                <div class="flex flex-row gap-4 justify-between small">
                  <div class="truncate">{{ entry.id }}</div>
                  <div class="whitespace-nowrap">{{ useDateFormat(entry.created, "YYYY-MM-DD HH:mm") }}</div>
                </div>
                <input type="radio"
                       :id="'entry-' + index"
                       :value="index"
                       v-model="store.stored.selectedIndex">
              </div>
            </TransitionGroup>
          </div>
        </div>

        <div class="overflow-y-auto flex flex-col gap-4">
          <div>
            <input v-model="selectedEntry.description"
                   style="width: 100%"
                   @input="dirty = true"
                   :disabled="disabled" />
          </div>

          <div :style="{ opacity: disabled ? 0.5 : 1, flex: 1 }">
            <MonacoEditor language="css"
                          :disabled="disabled"
                          @input="dirty = true"
                          :value="styleValue"
                          v-model="selectedEntry.style" />
          </div>

          <div :style="{ opacity: disabled ? 0.5 : 1, flex: 1 }">
            <MonacoEditor language="javascript"
                          :disabled="disabled"
                          @input="dirty = true"
                          :value="scriptValue"
                          v-model="selectedEntry.script" />
          </div>
        </div>
      </div>

      <div class="flex flex-row gap-4 flex-wrap">
        <button @click="save"
                :disabled="!dirty"
                class="btn-outlined">
          Save
        </button>
        <button @click="injectCSS"
                class="btn-outlined">
          Inject CSS
        </button>
        <button :disabled="store.stored.injectedCSS.length === 0"
                @click="removeInjectedCSS"
                class="btn-outlined">
          Remove CSS
        </button>
        <button @click="executeScript"
                class="btn-outlined">
          Execute Script
        </button>
      </div>

      <div
          class="data-[open=false]:overflow-auto border border-[var(--brand-6)] min-h-4 data-[open=false]:max-h-8 cursor-pointer"
          :data-open="showDebug"
          @click="toggleShowDebug"
      >
        <Debug>
          {{ JSON.stringify(store.stored.injectedCSS, null, 2) }}
        </Debug>
      </div>

    </template>

    <Teleport to="body">
      <Transition name="modal">
        <template v-if="!store.loaded">
          <div class="modal-layout">
            <div class="modal flex flex-col items-center justify-center gap-4">
              <h2>Loading</h2>
              <i-lucide-loader-circle class="spin size-8" />
            </div>
          </div>
        </template>
      </Transition>
    </Teleport>
    <Teleport to="body">
      <Transition name="modal">
        <template v-if="isRevealed">
          <div class="modal-layout">
            <div class="modal flex flex-col gap-4 modal-card">
              <h6>There are unsaved changes</h6>
              <div class="flex items-center gap-4">
                <i-lucide-info class="size-6" />
                Do you want to discard any unsaved changes?
              </div>
              <div class="flex flex-row justify-end gap-4">
                <button @click="confirm(true)">
                  Yes
                </button>
                <button @click="confirm(false)"
                        class="btn-outlined">
                  No
                </button>
              </div>
            </div>
          </div>
        </template>
      </Transition>
    </Teleport>
  </main>
</template>

<style>
.modal-card {
  background-color: var(--surface-2);
  border: 1px solid var(--surface-5);
  border-radius: 0.5rem;
  padding: 1rem;
}

.entry-list {
  display: flex;
  flex-direction: column;

  input {
    display: none;
  }

  .entry-button {
    user-select: none;

    /*var(--surface-5);*/
    --_border-color: transparent;
    --_bg-from: var(--surface-2); /*var(--surface-2);*/
    --_bg-to: transparent; /*var(--surface-2);*/
    /*border: 1px solid var(--_border-color);
    border-top: none;*/
    border-left: 3px solid transparent;
    padding: 0.75rem 0.75rem;
    color: oklch(from var(--gray-1) l c h / 0.75);
    font-weight: var(--font-weight-6);
    font-size: 0.8rem;
    background: linear-gradient(90deg, var(--_bg-from), var(--_bg-to));
    cursor: pointer;

    .small {
      font-size: 0.6rem;
      color: var(--text-muted);
    }

    .remove {
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover {
      /*color: var(--indigo-0);*/
      border-color: var(--brand);
      color: oklch(from var(--gray-1) l c h / 1);

      .remove {
        opacity: 0.5;

        &:hover {
          opacity: 1;
        }
      }
    }

    &:has(input:checked) {
      border-color: var(--brand);
      --_bg-from: oklch(from var(--brand) l c h / 0.33);
      color: oklch(from var(--gray-1) l c h / 1);
      /*--_border-color: var(--indigo-5);
      --_bg-from: var(--indigo-5);
      --_bg-to: var(--indigo-7);*/
      /*text-shadow: 0 1px 0 var(--indigo-9);
      box-shadow: inset 0 1px 0 oklch(from var(--indigo-3) l c h / 0.5);*/

      .small {
        color: var(--indigo-0);
      }
    }

    /*&:has(+ .entry-button input:checked) {
      border-bottom: none;
    }*/

    /*&:first-child {
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
      border-top: 1px solid var(--_border-color);
    }

    &:last-child {
      border-bottom-left-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
    }*/
  }
}

</style>