import { acceptHMRUpdate, defineStore } from 'pinia'
import type { StorageLikeAsync } from '@vueuse/core'

const storage: StorageLikeAsync = {
  async getItem(key: string) {
    const value = await chrome.storage.local.get(key);
    return value[key];
  },
  async setItem(key: string, value: string) {
    await chrome.storage.local.set({ [key]: value });
  },
  async removeItem(key: string) {
    await chrome.storage.local.remove(key);
  },
}

export const useAppStore = defineStore('app', () => {
  const count = useStorageAsync('count', 0, storage);
  const name = useStorageAsync('name', 'John Doe', storage);

  // You should probably use chrome.storage API instead of localStorage since localStorage
  // history can be cleared by the user.
  // See https://developer.chrome.com/docs/extensions/reference/api/storage

  const reset = () => {
    count.value = 0
    name.value = 'John Doe'
  }

  const increment = () => {
    count.value++
  }

  const decrement = () => {
    count.value--
  }

  return {
    count,
    name,
    reset,
    increment,
    decrement,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore as any, import.meta.hot))
}
  