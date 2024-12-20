<script lang="ts"
        setup>
import { useAppStore } from "@/stores/app.store";
import { setupMonaco } from "@/utils/monacoSetup";
import { getHighlighter } from "@/utils/shiki";
import type { CustomEntry } from "@/utils/state";
import { updateUserScripts } from "@/utils/userScript";
import { useAsyncState, useCloned, useConfirmDialog } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";
import { computed, ref, useTemplateRef } from "vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";

const store = useAppStore();
await store.loadData();
await setupMonaco();

const entryId = useRouteParams("id", undefined, { transform: String });

if (!entryId) {
	throw new Error("id is required");
}

function stringifyEntry(entry: CustomEntry) {
	return JSON.stringify(
		{
			description: entry.description,
			script: entry.script,
			site: entry.site,
			world: entry.world,
			runAt: entry.runAt,
			allFrames: entry.allFrames,
			enabled: entry.enabled,
		},
		null,
		2,
	);
}

const { cloned: entryRef, sync: syncEntryRef } = useCloned(() => {
	const entry = store.entries[entryId.value];
	if (!entry) {
		throw new Error(`Entry with id ${entryId} not found`);
	}
	return entry.state.value;
});
/*const { cloned: entryRef, sync: syncEntryRef } = useCloned(
	store.entries.ref[selectedIndex.value],
);*/
const initialValue = computed(() => {
	const entry = store.entries[entryId.value];
	if (!entry) {
		throw new Error(`Entry with id ${entryId} not found`);
	}
	return stringifyEntry(entry.state.value);
});

const isModified = computed(() => {
	const currentValue = stringifyEntry(entryRef.value);
	return currentValue !== initialValue.value;
});

const storageUsed = computed(() => {
	return JSON.stringify(entryRef.value).length;
});

const storageLeft = computed(() => {
	return chrome.storage.sync.QUOTA_BYTES_PER_ITEM - storageUsed.value;
});

const {
	isRevealed: showModal,
	reveal: revealModal,
	confirm: confirmModal,
	cancel: cancelModal,
} = useConfirmDialog();

async function shouldNavigate() {
	if (isModified.value) {
		const { isCanceled, data } = await revealModal();
		if (isCanceled || !data) {
			return false;
		}
	}
	return true;
}

onBeforeRouteUpdate(async () => {
	return await shouldNavigate();
});

onBeforeRouteLeave(async () => {
	return await shouldNavigate();
});

function isUserScriptsAvailable() {
	try {
		// Property access which throws if developer mode is not enabled.
		chrome.userScripts;
		return true;
	} catch {
		return false;
	}
}

const hasUserScripts = ref<boolean>(isUserScriptsAvailable());

const {
	state: userScripts,
	isReady,
	execute: refreshUserScripts,
	isLoading,
} = await useAsyncState(async () => {
	try {
		return await chrome.userScripts.getScripts();
	} catch (e) {
		return [];
	}
}, []);

const selectedUserScript = computed(() =>
	userScripts.value.find((script) => script.id === entryRef.value.id),
);

const saveButton = useTemplateRef("saveButton");

const reset = async () => {
	syncEntryRef();
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

	entryRef.value.revision++;
	entryRef.value.modified = Date.now();

	const entry = store.entries[entryId.value];
	if (!entry) {
		throw new Error(`Entry with id ${entryId} not found`);
	}

	entry.state.value = entryRef.value;

	const entries = Object.values(store.entries).map(
		(entry) => entry.state.value,
	);

	console.log("Entries", store.entries);
	const scriptChanges = await updateUserScripts(entries);

	console.log("Saved", scriptChanges);

	await refreshUserScripts();

	// await router.push(`/options/${selectedIndex.value}`);
};

async function loadUserScript() {
	if (!selectedUserScript.value) {
		store.logError("User script not found");
		return;
	}

	const code = selectedUserScript.value.js[0].code;
	if (!code) {
		store.logError("User script has no code");
		return;
	}

	const prevValue = entryRef.value.script;
	entryRef.value.script = code;

	console.log("Loaded user script", {
		code: code,
		prevValue: prevValue,
	});
}

const highlighter = await getHighlighter();

const vColorize = {
	mounted: async (el: HTMLElement) => {
		const colorized = highlighter.codeToHtml(el.textContent ?? "", {
			theme: "andromeeda",
			lang: "javascript",
		});
		el.innerHTML = colorized;

		/*const colorized = await monaco.editor.colorize(
			el.textContent ?? "",
			"javascript",
			{
				tabSize: 2,
			},
		);

		el.innerHTML = colorized;*/
		/*await monaco.editor.colorizeElement(el, {
			theme: "andromeeda",
			mimeType: "text/javascript",
		});*/
	},
};

const storageQuota = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;
</script>


<template>
  <div v-if="hasUserScripts">
    <div class="flex flex-col gap-4">
      <div>
        Script Id: <span class="font-mono">{{ entryRef.id }}</span>
      </div>

      <div>
        Used: {{ storageUsed }} out of {{ storageQuota }} bytes
      </div>

      <EditEntry v-model="entryRef" @save="save" />

      <div class="flex gap-4">
        <button ref="saveButton"
                class="btn-outlined"
                @click="save">
          <i-lucide-save />
          Save
        </button>
        <button ref="resetButton"
                :disabled="!isModified"
                class="btn-outlined"
                @click="reset">
          <i-lucide-undo />
          Reset
        </button>
      </div>

      <template v-if="store.showDebug">
        <template v-if="selectedUserScript">
          <div class="border border-[var(--input-border)] p-4 flex rounded-md flex-col gap-4"
               tabindex="-1"
               @click="$event.currentTarget!.toggleAttribute('aria-expanded')">
            <div>
              <h3 class="mb-4">
                Registered user script
              </h3>
              <div class="text-sm">
                <table>
                  <tbody>
                    <tr>
                      <td class="text-gray-400 text-right">id</td>
                      <td class="font-mono text-left">{{ selectedUserScript.id }}</td>
                    </tr>
                    <tr>
                      <td class="text-gray-400 text-right">matches</td>
                      <td class="font-mono text-left">{{ selectedUserScript.matches }}</td>
                    </tr>
                    <tr>
                      <td class="text-gray-400 text-right">world</td>
                      <td class="font-mono text-left">{{ selectedUserScript.world }}</td>
                    </tr>
                    <tr>
                      <td class="text-gray-400 text-right">run at</td>
                      <td class="font-mono text-left">{{ selectedUserScript.runAt }}</td>
                    </tr>
                    <tr>
                      <td class="text-gray-400 text-right">allFrames</td>
                      <td class="font-mono text-left">{{ selectedUserScript.allFrames }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div ref="registeredUserScript"
                   v-colorize
                   class="data font-mono text-[0.75rem] font-normal mb-4"
                   data-lang="javascript">
                {{ selectedUserScript.js[0].code }}
              </div>
              <div class="flex flex-row justify-end">
                <button class="btn-outlined"
                        @click="loadUserScript">
                  Use this
                </button>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div>
            No registered user script found.
          </div>
        </template>
      </template>

    </div>

    <template v-if="showModal">
      <Teleport to="body">
        <Transition name="modal">
          <div class="modal-layout">
            <div class="modal flex flex-col gap-4 modal-card">
              <h6>There are unsaved changes</h6>
              <div class="flex items-center gap-4">
                <i-lucide-info class="size-6" />
                Do you want to discard any unsaved changes?
              </div>
              <div class="flex flex-row justify-end gap-4">
                <button @click="confirmModal(true)">
                  Yes
                </button>
                <button class="btn-outlined"
                        @click="confirmModal(false)">
                  No
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </div>
  <div v-else>
    <div class="flex flex-row gap-4 items-center justify-center">
      <i-lucide-info class="size-6" />
      User scripts are not supported in this browser.
    </div>
  </div>
</template>

<style>
.folded {
  height: 40px;
  overflow: hidden;

  transition: height 500ms;

  &[aria-expanded], &:focus-visible, &:hover {
    height: auto;
  }
}

dl {
  font-size: var(--font-size-0);

  > div {
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5em;
    justify-content: start;
  }
}
</style>