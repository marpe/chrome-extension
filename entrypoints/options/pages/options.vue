<script lang="ts" setup>
import presets from "@/assets/presets.json";
import { useAppStore } from "@/stores/app.store";
import { setupMonaco } from "@/utils/monacoSetup";
import * as monaco from "monaco-editor";
import { useTemplateRef } from "vue";

const { isRevealed, reveal, confirm, cancel } = useConfirmDialog();
const store = useAppStore();

const { logs, logInfo, logError } = useLogging();

const { injectCSS, removeInjectedCSS, executeScript } = useScripting();

const initialStyle = `body {
  background-color: red;
}`;

const initialScript = `var printHello = () => { console.log('Hello from the script'); };
printHello();`;

const styleValue = ref({ value: "" });
const scriptValue = ref({ value: "" });

const userScripts = ref<chrome.userScripts.RegisteredUserScript[]>([]);

const registeredUserScriptEl = useTemplateRef("registeredUserScript");

async function refreshUserScripts() {
	userScripts.value = await chrome.userScripts.getScripts();
}

onMounted(async () => {
	setupMonaco();
	await refreshUserScripts();
});

watch(
	() => store.selectedEntry,
	async (entry) => {
		// setting these triggers the MonacoEditor components to update
		styleValue.value = { value: entry?.style ?? initialStyle };
		scriptValue.value = { value: entry?.script ?? initialScript };
	},
);

const selectedUserScript = computed(() => {
	return userScripts.value.find(
		(script) => script.id === store.selectedEntry?.id,
	);
});

const selectedUserScriptHtml = computedAsync(async () => {
	return await monaco.editor.colorize(
		selectedUserScript.value?.js[0].code ?? "",
		"javascript",
		{},
	);
});

/*watch(registeredUserScriptEl, async () => {
	if (selectedUserScript.value && registeredUserScriptEl.value) {
		await colorizeElement(registeredUserScriptEl.value);
	}
});*/

function loadUserScript() {
	if (!selectedUserScript.value) {
		logError("User script not found");
		return;
	}

	const code = selectedUserScript.value.js[0].code;
	if (!code) {
		logError("User script has no code");
		return;
	}

	store.selectedEntry.script = code;

	// refresh the MonacoEditor component
	scriptValue.value = { value: store.selectedEntry.script };
}

const saveButton = useTemplateRef("saveButton");

const lastLog = computed(() => {
	return logs.ref[logs.ref.length - 1];
});

const logOpen = ref(false);

const downloadData = async () => {
	const data = {
		entries: toRaw(store.entries.ref),
	};
	const json = JSON.stringify(data, null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "data.json";
	a.click();
	URL.revokeObjectURL(url);
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

const importPresets = () => {
	store.entries.ref = presets.entries;
};

const removeAll = () => {
	store.entries.ref = [];
};

const clear = async () => {
	const scripts = await chrome.userScripts.getScripts();
	logInfo("Unregistering scripts", scripts);
	await chrome.userScripts.unregister();

	await refreshUserScripts();
};

const loadRegistered = async () => {
	const scripts = await chrome.userScripts.getScripts();
	logInfo("Registered scripts", scripts);

	for (const registeredScript of scripts) {
		const scriptEntry = store.entries.ref.find(
			(entry) => entry.id === registeredScript.id,
		);
		if (scriptEntry) {
			if (registeredScript.js.length === 0) {
				logError("Script has no js", { registeredScript, scriptEntry });
				continue;
			}

			if (scriptEntry.script !== registeredScript.js[0].code) {
				logError("Script does not match", { registeredScript, scriptEntry });
			} else {
				logInfo("Script matches", { registeredScript, scriptEntry });
			}
		} else {
			logError("Script not found", registeredScript);
		}
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

	await removeInjectedCSS(store.injectedCSS.ref);
	const { successfulInjections, failedInjections } = await injectCSS(
		store.entries.ref,
	);
	await executeScript(store.entries.ref);
	store.setCSSInjections(successfulInjections);

	await refreshUserScripts();

	console.log("Saved and injected");
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

const { isSupported, open, sRGBHex } = useEyeDropper();
const openEyeDropper = () => {
	open().then((result) => {
		navigator.clipboard.writeText(sRGBHex.value.toString());
		console.log(`EyeDropper: ${sRGBHex.value}`);
	});
};
</script>

<template>
    <main>
        <template v-if="store.loaded">

            <div class="grid grid-cols-[260px_1fr] flex-1 overflow-hidden">
                <div class="flex flex-col gap-4 overflow-hidden">
                    <div class="flex flex-row gap-2 flex-wrap pt-4 pl-4">
                        <button class="text-white/50 hover:text-white transition-all size-9 p-0 rounded-md" title="Add new entry"
                            @click="() => { store.addEntry(); save(); }">
                            <i-lucide-circle-plus />
                        </button>
                        <button class="text-white/50 hover:text-white transition-all size-9 p-0 rounded-md" title="Remove selected entry"
                            @click="() => { store.removeSelectedEntry(); save(); }">
                            <i-lucide-circle-minus />
                        </button>
                      <button class="text-white/50 hover:text-white transition-all size-9 p-0 rounded-md" title="EyeDropper"
                      @click="openEyeDropper">
                        <i-lucide-palette />
                      </button>
                    </div>
                    <div class="entry-list overflow-y-auto px-4">
                        <TransitionGroup>
                            <div v-for="(entry, index) in store.entries.ref" :key="index"
                                :class="{ checked: store.selectedIndex.ref.value === index }"
                                class="flex flex-col gap-2 entry-button"
                                @click="() => { store.selectEntry(index); save(); }">
                                <div class="flex flex-row justify-between items-center">
                                    <div>{{ entry.description }}</div>
                                    <button class="remove btn-unstyled"
                                        @click.stop="() => { store.removeEntry(index); save(); }">
                                        <i-lucide-x class="size-4" />
                                    </button>
                                </div>
                                <div class="flex flex-row gap-4 justify-between small">
                                    <div class="truncate">{{ entry.site }}</div>
                                    <div class="whitespace-nowrap">{{ useDateFormat(entry.created, "YYYY-MM-DD HH:mm")
                                        }}</div>
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
                            <input v-model="store.selectedEntry.description" style="width: 100%" />
                        </div>

                        <div>
                            <input v-model="store.selectedEntry.site" style="width: 100%" />
                        </div>

                        <div :style="{ flex: '0 1 0' }">
                            <MonacoEditor v-model="store.selectedEntry.style" :value="styleValue" language="css" />
                        </div>

                        <div :style="{ flex: '0 1 0' }">
                            <MonacoEditor v-model="store.selectedEntry.script" :value="scriptValue" language="javascript" />
                        </div>

                        <div class="flex flex-col gap-4">
                          <template v-if="selectedUserScript">
                            <div>
                              Registered user script
                            </div>
                            <div class="text-sm">
                              <div>id: <span class="font-mono">{{ selectedUserScript?.id }}</span></div>
                              <div>matches: <span class="font-mono">{{ selectedUserScript?.matches }}</span></div> 
                            </div>
                            <div ref="registeredUserScript"
                                 class="data font-mono text-[0.75rem] font-normal"
                                 data-lang="javascript"
                                 v-html="selectedUserScriptHtml">
                            </div>
                            <div>
                              <button class="btn-outlined" @click="loadUserScript">
                                Load
                              </button>
                            </div>
                          </template>
                          <template v-else>
                            <div>
                              No registered user script found.
                            </div>
                          </template>
                        </div>
                    </template>
                </div>
            </div>

            <div class="px-4 pb-4 flex gap-4">
              <PopoverMenu>
                <template #default="defaultProps">
                  <div class="inline-flex flex-row border border-[var(--brand-6)] rounded-md">
                    <button ref="saveButton" class="border-r rounded-r-none border-r-[var(--brand-6)] px-6"
                            @click="save">
                      <i-lucide-save /> Save
                    </button>
                    <button :class="{ ['aspect-square']: true }" :style="{ anchorName: defaultProps.anchorName }" @click="defaultProps.open">
                      <i-lucide-chevron-up />
                    </button>
                  </div>
                </template>
                <template #menu="openProps">
                  <button @click="exportData();openProps.open(false)">
                    <i-lucide-clipboard /> Copy to Clipboard
                  </button>

                  <button @click="downloadData">
                    <i-lucide-download /> Download
                  </button>

                  <button @click="importData">
                    <i-lucide-clipboard-paste /> Import from Clipboard
                  </button>

                  <button @click="importPresets">
                    <i-lucide-import /> Import Presets
                  </button>

                  <button @click="removeAll">
                    <i-lucide-trash-2 /> Remove All
                  </button>
                </template>
              </PopoverMenu>

              <button ref="logButton" class="btn-outlined" @click="loadRegistered">
                <i-lucide-letter-text /> Log
              </button>

              <button ref="clearButton" class="btn-outlined" @click="clear">
                <i-lucide-trash-2 /> Clear
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
                                <button class="btn-outlined" @click="confirm(false)">
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

.data {
  background-color: var(--surface-2);
  border: 1px solid var(--surface-6);
  color: var(--text-3);
  //cursor: pointer;
  margin-top: 0.5rem;
  min-height: 1ch;
  overflow: hidden;
  padding: 0.5rem;
  &[data-open="false"] {
    max-height: 1rem;
    overflow: clip;
  }
}

.entry-list {
    display: flex;
    flex-direction: column;

    /*input {
    display: none;
  }*/

    .entry-button {
        background: linear-gradient(90deg, var(--_bg-from), var(--_bg-to));

        /*var(--surface-5);*/
        border-bottom: 1px solid oklch(from var(--brand) l c h / 0.4);
        border-left: 3px solid transparent;
        /*var(--surface-2);*/
        --_border-color: transparent;
        /*var(--surface-2);*/
        /*border: 1px solid var(--_border-color);
    border-top: none;*/
        color: oklch(from var(--gray-1) l c h / 0.75);
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: var(--font-weight-6);
        --_bg-from: var(--surface-2);
        padding: 0.75rem 0.75rem;
        --_bg-to: transparent;
        user-select: none;

        .small {
            color: var(--text-muted);
            font-size: 0.6rem;
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
            color: oklch(from var(--gray-1) l c h / 1);
            --_bg-from: oklch(from var(--brand) l c h / 0.33);
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
