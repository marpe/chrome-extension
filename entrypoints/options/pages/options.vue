<script lang="ts"
        setup>
import { useAppStore } from "@/stores/app.store";
import { createEntry } from "@/utils/createEntry";
import type { Entry } from "@/utils/state";
import { timestamp } from "@vueuse/core";
import { nanoid } from "nanoid";
import { onMounted } from "vue";
import type { Scripting, Tabs } from "wxt/browser";

type CSSInjection = Scripting.CSSInjection;

const { isRevealed, reveal, confirm, cancel } = useConfirmDialog();
const store = useAppStore();

const { logs, logInfo, logError } = useLogging();

const clearInjections = () => {
	while (store.injectedCSS.ref.length) {
		store.injectedCSS.ref.pop();
	}
};

const queryTabs = async () => {
	try {
		const allTabs = await browser.tabs.query({});
		// logInfo("All tabs", allTabs);
		return allTabs;
	} catch (e) {
		logError("Error querying tabs", e);
	}
};

const executeScript = async () => {
	const scriptIds = store.entries.ref.map((entry) => entry.id);

	const scriptEntries = store.entries.ref.map((entry) => ({
		id: entry.id,
		js: [{ code: entry.script }],
		matches: [`*://${entry.site}/*`],
	}));

	const existingScripts = await chrome.userScripts.getScripts({
		ids: scriptIds,
	});

	for (const entry of scriptEntries) {
		const existing = existingScripts.find((script) => script.id === entry.id);
		if (existing) {
			await chrome.userScripts.update([entry]);
			logInfo(`Updated script: ${entry.id}`);
		} else {
			await chrome.userScripts.register([entry]);
			logInfo(`Registered script: ${entry.id}`);
		}
	}
	const removedScripts = existingScripts.filter(
		(script) => !scriptIds.includes(script.id),
	);
	logInfo("Removing scripts", removedScripts);
	await chrome.userScripts.unregister({
		ids: removedScripts.map((entry) => entry.id),
	});
};

const tryRemoveCSS = async (injection: CSSInjection) => {
	try {
		await browser.scripting.removeCSS(injection);
		return true;
	} catch (e) {
		logError(`Error removing CSS: ${e}`, { e, injection });
		return false;
	}
};

const removeInjectedCSS = async () => {
	try {
		const cssInjections = store.injectedCSS;
		await Promise.all(cssInjections.ref.map(tryRemoveCSS));
		clearInjections();
	} catch (e) {
		logError("Error removing CSS", e);
	}
};

const tryInjectCSS = async (injection: CSSInjection) => {
	try {
		await browser.scripting.insertCSS(injection);
		return true;
	} catch (e) {
		logError(`Error injecting CSS: ${e}`, { e, injection });
		return false;
	}
};

const injectCSS = async () => {
	try {
		await removeInjectedCSS();
		const tabs = (await queryTabs()) ?? [];

		const cssInjections = tabs
			.filter((tab) => tab.id !== undefined)
			.map(({ id }) => {
				return {
					css: store.entries.ref.map((entry) => entry.style).join("\n"),
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

		logInfo("CSS injected", { successfulInjections, failedInjections });

		store.injectedCSS.ref.push(...successfulInjections);
	} catch (e) {
		logError("Error injecting CSS", e);
	}
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
	const entry = createEntry();
	store.entries.ref.push(entry);
	logInfo(`Added entry, number of entries: ${store.entries.ref.length}`);
	selectEntry(store.entries.ref.length - 1);
};

const disabled = ref(true);

const selectEntry = (index: number) => {
	store.selectedIndex.ref.value = index;
	if (index === -1) {
		selectedEntry.value = {
			id: "",
			description: "",
			site: "*",
			created: Date.now(),
			modified: Date.now(),
			style: "",
			script: "",
			revision: 1,
		};
		styleValue.value = { value: "" };
		scriptValue.value = { value: "" };
		disabled.value = true;
		return;
	}
	const entry = store.entries.ref[index];
	selectedEntry.value = entry;
	styleValue.value = { value: entry.style };
	scriptValue.value = { value: entry.script };
	disabled.value = false;
};

const selectedEntry = ref<Entry>(createEntry());

const clamp = (value: number, min: number, max: number) => {
	return Math.min(Math.max(value, min), max);
};

const removeEntry = (index: number) => {
	store.entries.ref.splice(index, 1);

	const clamped = clamp(index, 0, store.entries.ref.length - 1);
	if (clamped !== index) {
		selectEntry(clamped);
	}
	logInfo(`Removed entry, number of entries: ${store.entries.ref.length}`);
};

const removeSelected = () => {
	const index = store.selectedIndex.ref.value;
	if (index === -1) {
		return;
	}
	removeEntry(index);
};

watch(
	() => store.loaded,
	(newVal) => {
		if (newVal) {
			logInfo("Loaded finished", toRaw(store.selectedIndex.ref));
			selectEntry(store.selectedIndex.ref.value);
		} else {
			logInfo("Loaded received false");
		}
	},
);

watch(
	() => store.selectedIndex.ref,
	(newVal) => {
		logInfo("Selected index changed", newVal);
	},
);

const save = async () => {
	await store.save();
	logInfo("Saved");
	await injectCSS();
	await executeScript();
};

const keys = useMagicKeys({
	passive: false,
	onEventFired: (event) => {
		if (event.key === "s" && event.ctrlKey) {
			save();
			event.preventDefault();
		}
	},
});
</script>

<template>
  <main>
    <template v-if="store.loaded">

      <div class="grid grid-cols-[200px_1fr] flex-1 overflow-hidden">
        <div class="flex flex-col gap-4 overflow-hidden">
          <div class="flex flex-row gap-2 flex-wrap pt-4 pl-4">
            <button @click="() => { addEntry(); save(); }"
                    title="Add new entry"
                    class="btn-icon">
              <i-lucide-circle-plus />
            </button>
            <button @click="() => { removeSelected(); save(); }"
                    :disabled="disabled"
                    title="Remove selected entry"
                    class="btn-icon">
              <i-lucide-circle-minus />
            </button>
          </div>
          <div class="entry-list overflow-y-auto px-4">
            <TransitionGroup>
              <div v-for="(entry, index) in store.entries.ref"
                   :key="index"
                   @click="() => { selectEntry(index); save(); }"
                   :class="{ checked: store.selectedIndex.ref.value === index }"
                   class="flex flex-col gap-2 entry-button">
                <div class="flex flex-row justify-between items-center">
                  <div>{{ entry.description }}</div>
                  <button class="remove btn-unstyled"
                          @click.stop="removeEntry(index)">
                    <i-lucide-x class="size-4" />
                  </button>
                </div>
                <div class="flex flex-row gap-4 justify-between small">
                  <div class="truncate">{{ entry.site }}</div>
                  <div class="whitespace-nowrap">{{ useDateFormat(entry.created, "YYYY-MM-DD HH:mm") }}</div>
                </div>
                <!--                <input type="radio"
                                       :id="'entry-' + index"
                                       :value="index"
                                       v-model="store.stored.selectedIndex">-->
              </div>
            </TransitionGroup>
          </div>
        </div>

        <div class="overflow-y-auto flex flex-col gap-4 px-4 pt-4">
          <div>
            <input v-model="selectedEntry.description"
                   style="width: 100%"
                   :disabled="disabled" />
          </div>

          <div>
            <input v-model="selectedEntry.site"
                   style="width: 100%"
                   :disabled="disabled" />
          </div>

          <div :style="{ opacity: disabled ? 0.5 : 1, flex: '0 1 0' }">
            <MonacoEditor language="css"
                          :disabled="disabled"
                          :value="styleValue"
                          v-model="selectedEntry.style" />
          </div>

          <div :style="{ opacity: disabled ? 0.5 : 1, flex: '0 1 0' }">
            <MonacoEditor language="javascript"
                          :disabled="disabled"
                          :value="scriptValue"
                          v-model="selectedEntry.script" />
          </div>
        </div>
      </div>

      <div class="flex flex-row gap-4 flex-wrap px-4 pb-4">
        <button @click="save"
                class="btn-outlined">
          Save
        </button>
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

  /*input {
    display: none;
  }*/

  .entry-button {
    user-select: none;

    /*var(--surface-5);*/
    --_border-color: transparent;
    --_bg-from: var(--surface-2); /*var(--surface-2);*/
    --_bg-to: transparent; /*var(--surface-2);*/
    /*border: 1px solid var(--_border-color);
    border-top: none;*/
    border-left: 3px solid transparent;
    border-bottom: 1px solid oklch(from var(--brand) l c h / 0.4);
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
      border-left-color: var(--brand);
      color: oklch(from var(--gray-1) l c h / 1);

      .remove {
        opacity: 0.5;

        &:hover {
          opacity: 1;
        }
      }
    }

    &.checked {
      border-left-color: var(--brand);
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