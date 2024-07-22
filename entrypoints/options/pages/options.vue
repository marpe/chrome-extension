<script lang="ts" setup>
import { useAppStore } from "@/stores/app.store";
const store = useAppStore();
</script>

<template>
  <div class="flex flex-col gap-4">
    <label>Script</label>
    <Debug>{{ store.script }}</Debug>
    <textarea v-model="store.script" />
    <button
      class="btn btn-primary"
      @click="store.toggle"
    >
      {{ store.enabled ? "Disable" : "Enable" }}
    </button>
  </div>
</template>

<style scoped>
</style>
