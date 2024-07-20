<script setup lang="ts">
const store = useAppStore()

const count = computed(() => store.count)
console.log(count)

const version = __VERSION__
const buildTime = __BUILD_TIME__.split('T')[1].slice(0, 5)
</script>

<template>
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

  <RouterView />

  <footer class="flex items-center justify-center gap-4">
    <div class="badge badge-primary badge-outline">
      v{{ version }}
    </div>
    <div>🕑 {{ buildTime }}</div>
  </footer>
</template>

<style scoped></style>
