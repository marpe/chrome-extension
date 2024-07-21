<script setup
        lang="ts"
>

useHead({
  title: 'Options',
  meta: [
    { name: 'description', content: 'Options page' },
  ],
})

const usedStorage = ref({})

onMounted(async () => {
  usedStorage.value = await chrome.storage.local.get(null)
})

async function clear() {
  await chrome.storage.local.clear()
  usedStorage.value = {}
}

const store = useAppStore()

const count = computed(() => store.count)
console.log(count)

const version = __VERSION__
const buildTime = __BUILD_TIME__.split('T')[1].slice(0, 5)

</script>

<template>
  <div class="grid grid-rows-[auto_1fr_auto] h-full ">
    <header class="my-6">
      <div class="flex items-center justify-center gap-4">
        <div class="text-blue-500 hover:text-blue-200">
          <NavLink :to="{ path: '/options' }">
            Options
          </NavLink>
        </div>
        <div class="text-blue-500 hover:text-blue-200">
          <NavLink :to="{ path: '/options/something' }">
            Something
          </NavLink>
        </div>
        <div class="text-blue-500 hover:text-blue-200">
          <NavLink :to="{ path: '/options/about' }">
            About
          </NavLink>
        </div>
      </div>
    </header>
    <main class="h-full">
      <RouterView />
    </main>
    <footer class="flex items-center justify-center gap-4">
      <div class="badge badge-primary badge-outline">
        v{{ version }}
      </div>
      <div>🕑 {{ buildTime }}</div>
    </footer>
  </div>
</template>

<style scoped></style>
