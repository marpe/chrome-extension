<script lang="ts"
        setup>
import { useAppStore } from "@/stores/app.store";
import { useTemplateRef } from "vue";
import type { Scripting } from "wxt/browser";

type CSSInjection = Scripting.CSSInjection;

const { isRevealed, reveal, confirm, cancel } = useConfirmDialog();
const store = useAppStore();

const { logs, logInfo, logError } = useLogging();

const presets = {
	keyListener: `console.log("Hello World")

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
        console.log('pressed', e);
        e.preventDefault();
    } else {
        console.log("pressed", e);
    }
});`,
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
		store.clearInjections();
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

		store.setCSSInjections(successfulInjections);
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

watch(
	() => store.selectedEntry,
	(entry) => {
		// setting these triggers the MonacoEditor components to update
		styleValue.value = { value: entry?.style ?? initialStyle };
		scriptValue.value = { value: entry?.script ?? initialScript };
	},
);

const saveButton = useTemplateRef("saveButton");

const lastLog = computed(() => {
	return logs.ref[logs.ref.length - 1];
});

const logOpen = ref(false);

const removeSelected = () => {
	const index = store.selectedIndex.ref.value;
	if (index === -1) {
		return;
	}
	store.removeEntry(index);
};

const exportData = async () => {
	try {
		const data = {
			entries: toRaw(store.entries.ref),
		};
		const json = JSON.stringify(data, null, 2);
		await navigator.clipboard.writeText(json);
		console.log("Copied to clipboard");
	} catch (e) {
		logError("Error exporting data", e);
	}
};

const importData = async () => {
	try {
		const json = await navigator.clipboard.readText();
		const data = JSON.parse(json);
		store.entries.ref = data.entries;
	} catch (e) {
		logError("Error importing data", e);
	}
};

const save = async () => {
	saveButton.value?.animate(
		[
			{ transform: "scale(1)" },
			{ transform: "scale(1.1)" },
			{ transform: "scale(1)" },
		],
		{
			duration: 200,
			easing: "ease-in-out",
		},
	);
	await store.save();
	logInfo("Saved");
	/*await injectCSS();
	await executeScript();*/
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

      <div class="grid grid-cols-[260px_1fr] flex-1 overflow-hidden">
        <div class="flex flex-col gap-4 overflow-hidden">
          <div class="flex flex-row gap-2 flex-wrap pt-4 pl-4">
            <button @click="() => { store.addEntry(); save(); }"
                    title="Add new entry"
                    class="text-white/50 hover:text-white transition-all size-9 p-0 rounded-md">
              <i-lucide-circle-plus />
            </button>
            <button @click="() => { removeSelected(); save(); }"
                    title="Remove selected entry"
                    class="text-white/50 hover:text-white transition-all size-9 p-0 rounded-md">
              <i-lucide-circle-minus />
            </button>
          </div>
          <div class="entry-list overflow-y-auto px-4">
            <TransitionGroup>
              <div v-for="(entry, index) in store.entries.ref"
                   :key="index"
                   @click="() => { store.selectEntry(index); save(); }"
                   :class="{ checked: store.selectedIndex.ref.value === index }"
                   class="flex flex-col gap-2 entry-button">
                <div class="flex flex-row justify-between items-center">
                  <div>{{ entry.description }}</div>
                  <button class="remove btn-unstyled"
                          @click.stop="store.removeEntry(index)">
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
          <template v-if="!!store.selectedEntry">
            <div>
              <input v-model="store.selectedEntry.description"
                     style="width: 100%" />
            </div>

            <div>
              <input v-model="store.selectedEntry.site"
                     style="width: 100%" />
            </div>

            <div :style="{ flex: '0 1 0' }">
              <MonacoEditor language="css"
                            :value="styleValue"
                            v-model="store.selectedEntry.style" />
            </div>

            <div :style="{ flex: '0 1 0' }">
              <MonacoEditor language="javascript"
                            :value="scriptValue"
                            v-model="store.selectedEntry.script" />
            </div>
          </template>
        </div>
      </div>

      <div class="flex flex-row gap-4 flex-wrap px-4 pb-4 items-start">
        <button @click="save"
                ref="saveButton"
                class="btn-outlined">
          Save
        </button>
        <button @click="exportData" class="btn-outlined">
          Export
        </button>

        <button @click="importData" class="btn-outlined">
          Import
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
