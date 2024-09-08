import type { StorageLikeAsync } from '@vueuse/core';
import { nanoid } from "nanoid";
import type { State } from "@/types/state";

const storageKey = "sync:app";
const storageLike = storage as StorageLikeAsync;

export const useAppStore = defineStore('app', () => {
  const loaded = ref(false);

  const stored = useStorageAsync<State>(storageKey, {
    theme: 'dark',
    saved: null,
    selectedIndex: 0,
    installed: Date.now(),
    entries: [
      {
        id: nanoid(),
        description: 'Hello World',
        style: 'body { background-color: #f00; }',
        script: 'console.log("Hello World")',
        created: Date.now(),
        modified: Date.now(),
        revision: 1,
      },
    ],
    injectedCSS: [],
  }, storageLike);

  watch(() => stored.value, (state) => {
    console.log('loaded from storage', toRaw(state));
    loaded.value = true;
  });

  return {
    loaded,
    stored,
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
}
