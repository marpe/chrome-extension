<script setup
        lang="ts"
>

import { useAppStore } from "@/stores/app.store";


const store = useAppStore();

const setTheme = (e: Event) => {
  console.log(e.target);
  // if you want this to not reset on page load
  // you'll want to set a cookie or local storage value
  // which restores the attribute on html

  const target = e.target as HTMLInputElement;
  document.firstElementChild!.setAttribute('color-scheme', target.value)
}
</script>

<template>
  <form id="theme">
    <label>
      Auto
      <input
        v-model="store.theme"
        type="radio"
        name="theme"
        value="auto"
        @input="setTheme"
      >
    </label>
    <label>
      Light
      <input
        v-model="store.theme"
        type="radio"
        name="theme"
        value="light"
        @input="setTheme"
      >
    </label>
    <label>
      Dark
      <input
        v-model="store.theme"
        type="radio"
        name="theme"
        value="dark"
        @input="setTheme"
      >
    </label>
  </form>
</template>
