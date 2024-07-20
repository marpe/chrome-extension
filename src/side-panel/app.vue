<script setup
        lang="ts"
>

import type { RouteRecordNormalized } from "vue-router";

const routes = ref([] as RouteRecordNormalized[]);
const router = useRouter();
router.getRoutes().forEach((route) => {
  routes.value.push(route);
});

const eyeDropper = useEyeDropper();
const clipboard = useClipboard();
const pickedColor = ref<string>("#000000");
const openEyeDropper = () => {
  return eyeDropper.open()
      .then((color) => {
        const colorString = color?.sRGBHex;
        if (colorString) {
          pickedColor.value = colorString;
          return clipboard.copy(colorString);
        }
      })
};

onKeyStroke(['e', 'E'], (e) => {
  if (e.altKey && e.ctrlKey && e.shiftKey) {
    e.preventDefault();
    void openEyeDropper()
  }
})

</script>

<template>
  <header>
    <h1> Side Panel Stuff</h1>
    <div>
      <RouterLink
          class="underline"
          to="/"
      >
        Home
      </RouterLink>
      <RouterLink
          class="underline"
          to="/options"
      >
        Options
      </RouterLink>
    </div>

    <div>
      <div>{{ pickedColor }}</div>
      <button
          class="btn btn-primary"
          @click="openEyeDropper"
      >
        Open Eye Dropper
      </button>
    </div>
  </header>

  <RouterView />

  <footer>
    <!--<Debug>{{ JSON.stringify(routes, null, 2) }}</Debug>-->
  </footer>
</template>

<style scoped></style>
