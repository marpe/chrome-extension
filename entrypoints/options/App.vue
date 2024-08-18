<script lang="ts" setup>
import About from "@/entrypoints/options/pages/about.vue";
</script>

<template>
  <h1>
    Options
  </h1>
  <strong>Current route path:</strong> {{ $route.fullPath }}
  <NavLink to="/options">
    Options
  </NavLink>
  <NavLink to="/about">
    About
  </NavLink>
  <router-view v-slot="{ Component }">
    <transition>
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<style scoped>
</style>
