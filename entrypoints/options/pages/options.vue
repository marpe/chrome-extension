<script lang="ts" setup>
import presets from "@/assets/presets.json";
import { useAppStore } from "@/stores/app.store";
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
                    </template>
                </div>
            </div>

            <div class="px-4 pb-4">
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
