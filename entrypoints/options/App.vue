<script lang="ts"
        setup>
</script>

<template>
  <nav class="flex flex-row gap-8 bg-[var(--surface-2)] px-6 py-4 border-b border-[var(--surface-4)]">
    <NavLink to="/options">
      Options
    </NavLink>
    <NavLink to="/about">
      About
    </NavLink>
  </nav>
  <RouterView v-slot="{ Component }">
    <Transition name="slide-up"
                mode="out-in">
      <KeepAlive>
        <Component :is="Component" />
      </KeepAlive>
    </Transition>
  </RouterView>
</template>

<style>

body {
  height: 100dvh;
  display: grid;
  grid-template-rows: 60px 1fr;
}

main {
  padding: 1rem;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
