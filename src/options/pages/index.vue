<script setup lang="ts">
import { stringify } from '@/lib/utils.ts'

const usedStorage = ref({})

onMounted(async () => {
  usedStorage.value = await chrome.storage.local.get(null)
})

async function clear() {
  await chrome.storage.local.clear()
  usedStorage.value = {}
}
</script>

<template>
  <div class="flex-1">
    No options here yet!...

    <button
      class="btn btn-primary"
      @click="clear"
    >
      Clear
    </button>
    <Debug>{{ stringify(usedStorage) }}</Debug>
  </div>
</template>

<style scoped></style>
