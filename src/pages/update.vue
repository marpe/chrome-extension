<script setup lang="ts">
const displayName = __DISPLAY_NAME__
const version = __VERSION__
</script>

<template>
  <div>
    <div
      class="flex flex-col gap-y-4"
    >
      <h1 class="text-4xl font-bold text-center">
        🎉 Updated! 🎉
      </h1>
      <p class="text-lg">
        {{ displayName }} has been updated to the latest version. 🎉
      </p>
      <p class="text-lg">
        Version: {{ version }}
      </p>

      <h1 class="text-2xl font-bold">
        What's new?
      </h1>
    </div>

    <Changelog />
  </div>
</template>

<style scoped>
</style>
