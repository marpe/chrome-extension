<script lang="ts"
        setup>
import { useAppStore } from "@/stores/app.store";
import { useRouteParams } from "@vueuse/router";
import * as monaco from "monaco-editor";
import { useTemplateRef } from "vue";

const store = useAppStore();
await until(() => store.entries.innerValue.loaded).toBe(true);

const { logError } = useLogging();

const route = useRoute("/options/[index]");
const router = useRouter();
const selectedIndex = useRouteParams("index", "-1", { transform: Number });

function stringifyEntry(entry: CustomEntry) {
  return JSON.stringify(
      {
        description: entry.description,
        script: entry.script,
        style: entry.style,
        site: entry.site,
        runAt: entry.runAt,
        enabled: entry.enabled,
      },
      null,
      2,
  );
}

const { cloned: entryRef, sync: syncEntryRef } = useCloned(() => {
  return store.entries.ref[selectedIndex.value];
});
/*const { cloned: entryRef, sync: syncEntryRef } = useCloned(
	store.entries.ref[selectedIndex.value],
);*/
const initialValue = computed(() =>
    stringifyEntry(store.entries.ref[selectedIndex.value]),
);

const isModified = computed(() => {
  const currentValue = stringifyEntry(entryRef.value);
  return currentValue !== initialValue.value;
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

const hasUserScripts = ref<boolean>(false);

const {
  state: userScripts,
  isReady,
  execute: refreshUserScripts,
  isLoading,
} = await useAsyncState(async () => {
  try {
    const scripts = await chrome.userScripts.getScripts();
    hasUserScripts.value = true;
    return scripts;
  } catch (e) {
    hasUserScripts.value = false;
    console.error(e);
    return [];
  }
}, []);

const selectedUserScript = computed(() =>
    userScripts.value.find((script) => script.id === entryRef.value.id),
);

const selectedUserScriptHtml = computedAsync(async () => {
  return await monaco.editor.colorize(
      selectedUserScript.value?.js[0].code ?? "",
      "javascript",
      {},
  );
});
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

  store.entries.ref = [
    ...store.entries.ref.slice(0, selectedIndex.value),
    entryRef.value,
    ...store.entries.ref.slice(selectedIndex.value + 1),
  ];

  await removeInjectedCSS(store.injectedCSS.ref);
  const { successfulInjections, failedInjections } = await injectCSS(
      store.entries.ref,
  );
  await executeScript(store.entries.ref);
  store.setCSSInjections(successfulInjections);

  console.log("Saved and injected");

  await refreshUserScripts();

  // await router.push(`/options/${selectedIndex.value}`);
};

async function loadUserScript() {
  if (!selectedUserScript.value) {
    logError("User script not found");
    return;
  }

  const code = selectedUserScript.value.js[0].code;
  if (!code) {
    logError("User script has no code");
    return;
  }

  const prevValue = entryRef.value.script;
  entryRef.value.script = code;

  console.log("Loaded user script", {
    code: code,
    prevValue: prevValue,
  });
}
</script>


<template>
  <div v-if="hasUserScripts">
    <div class="flex flex-col gap-4">
      <EditEntry v-model="entryRef" />
      <template v-if="selectedUserScript">
        <div class="border border-[var(--input-border)] p-4 flex rounded-md flex-col gap-4 userscript">
          <div>
            Registered user script
          </div>
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
                  <td class="text-gray-400 text-right">run at</td>
                  <td class="font-mono text-left">{{ selectedUserScript.runAt }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div ref="registeredUserScript"
               class="data font-mono text-[0.75rem] font-normal"
               data-lang="javascript"
               v-html="selectedUserScriptHtml">
          </div>
          <div class="flex flex-row justify-end">
            <button class="btn-outlined"
                    @click="loadUserScript">
              Use this
            </button>
          </div>
        </div>
      </template>
      <template v-else>
        <div>
          No registered user script found.
        </div>
      </template>
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
    <div class="flex flex-col gap-4">
      <div>
        <div>
          <i-lucide-info class="size-6" />
          User scripts are not supported in this browser.
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.userscript {
  height: 40px;
  overflow: clip;
  transition: height 0.5s ease;

  &:hover {
    height: auto;
  }
}
</style>