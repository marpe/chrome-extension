import { acceptHMRUpdate, defineStore } from 'pinia'
import type { StorageLikeAsync } from '@vueuse/core';
import { useStorageAsync } from '@vueuse/core';
import type { Scripting } from 'wxt/browser';
type CSSInjection = Scripting.CSSInjection;

const storageLike = storage as StorageLikeAsync;

export const useAppStore = defineStore('app', () => {
  const theme = useStorageAsync('local:theme', 'dark', storageLike);
  const count = useStorageAsync('local:count', 0, storageLike);
  const name = useStorageAsync('local:name', 'John Doe', storageLike);
  const script = useStorageAsync('local:script', '', storageLike);
  const style = useStorageAsync('local:style', '', storageLike);
  const enabled = useStorageAsync('local:enabled', true, storageLike);
  const injectedCss = useStorageAsync<CSSInjection[]>('local:injectedCss', [], storageLike);

  // You should probably use chrome.storage API instead of localStorage since localStorage
  // history can be cleared by the user.
  // See https://developer.chrome.com/docs/extensions/reference/api/storage

  const reset = () => {
    count.value = 0
    name.value = 'John Doe'
  }

  const increment = () => {
    count.value++;
  }

  const decrement = () => {
    count.value--;
  }

  const toggle = () => {
    enabled.value = !enabled.value
  }

  return {
    theme,
    count,
    name,
    script,
    enabled,
    style,
    toggle,
    reset,
    increment,
    decrement,
    injectedCss,
  } as const;
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore as any, import.meta.hot))
}
