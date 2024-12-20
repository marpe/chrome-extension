<script lang="ts"
        setup>
</script>

<template>
  <nav class="flex flex-row gap-8 bg-[var(--surface-2)] px-6 py-4 border-b border-[var(--surface-4)]">
    <NavLink to="/options">
      Options
    </NavLink>
    <NavLink to="/logs">
      Logs
    </NavLink>
    <NavLink to="/about">
      About
    </NavLink>
  </nav>
  <RouterView v-slot="{ Component }">
    <template v-if="Component">
      <Transition mode="out-in"
                  name="slide-up">
<!--        <KeepAlive>-->
          <Suspense>
            <component :is="Component" />

            <template #fallback>
              <div class="flex flex-col items-center justify-center gap-4">
                <h2>Loading</h2>
                <i-lucide-loader-circle class="spin size-8" />
              </div>
            </template>
          </Suspense>
<!--        </KeepAlive>-->
      </Transition>
    </template>
  </RouterView>
</template>

<style>

body {
  display: grid;
  grid-template-rows: 60px 1fr;
  height: 100dvh;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.125s ease-out;
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
