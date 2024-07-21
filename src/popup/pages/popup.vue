<script setup
        lang="ts"
>
useHead({
  title: 'Popup',
  meta: [
    {
      name: 'description',
      content: 'Popup description',
    },
  ],
});
</script>

<template>
  <header class="flex gap-4">
    <NavLink to="/popup">
      Popup
    </NavLink>
    <NavLink to="/popup/about">
      About
    </NavLink>
  </header>

  <RouterView />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
