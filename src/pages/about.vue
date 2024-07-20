<script setup lang="ts">
const router = useRouter();

const meta = import.meta;
const url = import.meta.url;
const env = import.meta.env;
</script>

<template>
  <Changelog />

  <Debug>env: {{ stringify(env) }}</Debug>
  <Debug>url: {{ stringify(url) }}</Debug>
  <Debug>meta: {{ stringify(meta) }}</Debug>
  <NavLink to="/" @click="router.go(-1)">
    Back
  </NavLink>
</template>

<style scoped></style>
