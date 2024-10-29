<script lang="ts"
        setup>
import presets from "@/assets/presets.json";
import { useFormatCreatedModified } from "@/composables/useCreatedModified";
import { useAppStore } from "@/stores/app.store";
import { createEntry } from "@/utils/createEntry";
import { setupMonaco } from "@/utils/monacoSetup";
import type { CustomEntry } from "@/utils/state";
import { updateUserScripts } from "@/utils/userScript";
import { useEyeDropper, useTimeAgo } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";
import { reactive } from "vue";
import { useRouter } from "vue-router";

const store = useAppStore();

await store.loadData();
await setupMonaco();

const router = useRouter();
const selectedEntryId = useRouteParams<string | undefined>("id", undefined);

if (selectedEntryId.value === undefined && store.entryIds.state.length > 0) {
	const firstId = store.entryIds.state[0];
	router.push(`/options/${firstId}`);
}

const exportData = async () => {
	await store.exportDataToClipboard();
};

const downloadData = async () => {
	await store.downloadData();
};

const importData = async () => {
	await store.importDataFromClipboard();
};

const importPresets = () => {
	const newEntries: CustomEntry[] = [];

	for (const preset of presets.entries) {
		const newEntry = createEntry(preset.description);
		newEntry.script = preset.script;
		newEntries.push(newEntry);
	}

	store.entryIds.state = [
		...store.entryIds.state,
		...newEntries.map((entry) => entry.id),
	];
};

const removeAll = () => {
	store.entryIds.state = [];
};

const clearUserScripts = async () => {
	const scripts = await chrome.userScripts.getScripts();
	store.logInfo("Unregistering scripts", scripts);
	await chrome.userScripts.unregister();
	// await refreshUserScripts();
};

const loadRegistered = async () => {
	const itemsInSync = await chrome.storage.sync.get();
	store.logInfo("Items in sync", itemsInSync);

	const scripts = await chrome.userScripts.getScripts();
	store.logInfo("Registered scripts", scripts);

	for (const registeredScript of scripts) {
		const scriptEntry = store.entries[registeredScript.id]?.state.value.script;
		if (scriptEntry) {
			if (registeredScript.js.length === 0) {
				store.logError("Script has no js", { registeredScript, scriptEntry });
				continue;
			}

			if (scriptEntry !== registeredScript.js[0].code) {
				store.logError("Script does not match", {
					registeredScript,
					scriptEntry,
				});
			} else {
				store.logInfo("Script matches", { registeredScript, scriptEntry });
			}
		} else {
			store.logInfo("Script not found", registeredScript);
		}
	}
};

const { isSupported, open, sRGBHex } = useEyeDropper();
const openEyeDropper = () => {
	open().then((result) => {
		navigator.clipboard.writeText(sRGBHex.value.toString());
		console.log(`EyeDropper: ${sRGBHex.value}`);
	});
};

function addEntry() {
	store.addEntry();
}

function selectEntry(entryId: string) {
	store.selectEntry(entryId);
}

function formatCreatedAndModified(entry: CustomEntry) {
	const { created, modified } = useFormatCreatedModified(entry);
	return `Created: ${created} - Modified: ${modified}`;
}

async function removeEntry(entryId: string) {
	await store.removeEntry(entryId);

	const entries = Object.values(store.entries).map(
		(entry) => entry.state.value,
	);
	const scriptChanges = await updateUserScripts(entries);
	console.log("Removed script", scriptChanges);
	await router.push(`/options`);
}
</script>

<template>
  <main>
    <div class="grid grid-cols-[260px_1fr] flex-1 overflow-y-auto">
      <div class="flex flex-col gap-4 overflow-hidden">
        <div class="flex flex-row gap-2 flex-wrap pt-4 pl-4">
          <button class="text-white/50 hover:text-white transition-all size-9 p-0 rounded-md"
                  title="Add new entry"
                  @click="() => { addEntry() }">
            <i-lucide-circle-plus />
          </button>
          <button :disabled="selectedEntryId === undefined"
                  class="text-white/50 hover:text-white transition-all size-9 p-0 rounded-md"
                  title="Remove selected entry"
                  @click="() => { removeEntry(selectedEntryId!) }">
            <i-lucide-circle-minus />
          </button>
          <button class="text-white/50 hover:text-white transition-all size-9 p-0 rounded-md"
                  title="EyeDropper"
                  @click="openEyeDropper">
            <i-lucide-palette />
          </button>
        </div>
        <div class="entry-list overflow-y-auto px-4">
          <TransitionGroup>
            <div v-for="(entry, entryId, index) in store.entries"
                 :key="entryId"
                 :class="{ checked: selectedEntryId === entryId }"
                 class="flex flex-col gap-2 entry-button"
                 @click="() => selectEntry(entryId)">
              <div class="flex flex-row justify-between items-center">
                <div>{{ entry.state.value.description }}</div>
                <button class="remove btn-unstyled"
                        @click.stop="() => { removeEntry(entryId) }">
                  <i-lucide-x class="size-4" />
                </button>
              </div>
              <div class="flex flex-row gap-4 justify-between small">
                <div class="truncate">{{ entry.state.value.site }}</div>
                <div :title="formatCreatedAndModified(entry.state.value)"
                     class="flex flex-row items-center">
                  <i-lucide-clock class="mr-2" />
                  <span>{{ useTimeAgo(entry.state.value.modified) }}</span>
                </div>
              </div>
              <!--                <input type="radio"
                     :id="'entry-' + index"
                     :value="index"
                     v-model="store.stored.selectedIndex">-->
            </div>
          </TransitionGroup>
        </div>
      </div>

      <div class="flex flex-col gap-4 px-4 pt-4">
        <div class="flex flex-col gap-4">
          <template v-if="selectedEntryId && store.entries[selectedEntryId]">
            <RouterView v-slot="{ Component }">
              <template v-if="Component">
                <Transition mode="out-in" name="slide-up">
                  <component :is="Component" :key="selectedEntryId" />
                </Transition>
              </template>
            </RouterView>
          </template>
          <template v-else>
            <div>
              No entry selected
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="px-4 pb-4 flex gap-4">
      <PopoverMenu>
        <template #default="defaultProps">
          <div class="inline-flex flex-row border border-[var(--brand-6)] rounded-md">
            <button ref="saveButton"
                    class="border-r rounded-r-none border-r-[var(--brand-6)] px-6"
                    @click="downloadData">
              <i-lucide-download />
              Download
            </button>
            <button :class="{ ['aspect-square']: true }"
                    :style="{ anchorName: defaultProps.anchorName }"
                    @click="defaultProps.open">
              <i-lucide-chevron-up />
            </button>
          </div>
        </template>
        <template #menu="openProps">
          <button @click="exportData();openProps.open(false)">
            <i-lucide-clipboard />
            Copy to Clipboard
          </button>

          <button @click="importData">
            <i-lucide-clipboard-paste />
            Import from Clipboard
          </button>

          <button @click="importPresets">
            <i-lucide-import />
            Import Presets
          </button>

          <button @click="removeAll">
            <i-lucide-trash-2 />
            Remove All
          </button>
        </template>
      </PopoverMenu>

      <button ref="logButton"
              class="btn-outlined"
              @click="loadRegistered">
        <i-lucide-letter-text />
        Log
      </button>

      <button ref="clearButton"
              class="btn-outlined"
              @click="clearUserScripts">
        <i-lucide-trash-2 />
        Clear
      </button>
    </div>


  </main>
</template>

<style>
svg {
  display: inline-block;
}

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
  /*cursor: pointer;*/
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
