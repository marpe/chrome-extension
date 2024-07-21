<script setup lang="ts">
const env = import.meta.env;
const url = import.meta.url;
</script>

<template>
  <Debug>env: {{ stringify(env) }}</Debug>
  <Debug>url: {{ stringify(url) }}</Debug>
  <Changelog />
</template>

<style scoped></style>
