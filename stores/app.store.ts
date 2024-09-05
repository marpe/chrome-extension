import type { StorageLikeAsync } from '@vueuse/core';
import type { Scripting } from 'wxt/browser';
import { Store } from "pinia";

type CSSInjection = Scripting.CSSInjection;

const storageLike = storage as StorageLikeAsync;

type Entry = {
  description: string,
  style: string,
  script: string,
  timestamp: number
};

interface State {
  theme: string;
  installed: number;
  modified: number;
  entries: Entry[];
  injectedCSS: CSSInjection[],
}

export const useAppStore = defineStore('app', () => {
  const loaded = ref(false);
  const injectedCSS = ref([] as CSSInjection[]);
  const entries = ref([] as Entry[]);
  const installed = ref(Date.now());
  const modified = ref(Date.now());
  const theme = ref('dark');

  const stored = useStorageAsync<State>('local:app', {
    theme: 'dark',
    installed: Date.now(),
    modified: Date.now(),
    entries: [] as Entry[],
    injectedCSS: [] as CSSInjection[],
  }, storageLike);

  async function loadFromStorage() {
    const data = await storageLike.getItem('local:app');
    if (data) {
      try {
        const appState = JSON.parse(data) as State;
        theme.value = appState.theme ?? 'dark';
        installed.value = appState.installed ?? Date.now();
        modified.value = appState.modified ?? Date.now();
        entries.value = appState.entries ?? [];
        injectedCSS.value = appState.injectedCSS ?? [];
      } catch (e) {
        console.error(e);
      }
    }
    loaded.value = true;
  }

  return {
    theme,
    installed,
    modified,
    entries,
    injectedCSS,
    loaded,
    loadFromStorage,
    stored,
  }
});

/*watch(
    pinia.state,
    (state) => {
      storageLike.setItem('local:app', JSON.stringify(state));
    },
    { deep: true },
);*/

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
}
