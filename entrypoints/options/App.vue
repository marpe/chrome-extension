<script lang="ts" setup>
</script>

<template>
  <h1>
    Options
  </h1>
  <div>
    <strong>Current route path:</strong> {{ $route.fullPath }}
  </div>
  <nav>
    <NavLink to="/options">
      Options
    </NavLink>
    <NavLink to="/about">
      About
    </NavLink>
  </nav>
  <router-view v-slot="{ Component }">
    <transition name="slide-up" mode="out-in">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<style scoped>
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

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
