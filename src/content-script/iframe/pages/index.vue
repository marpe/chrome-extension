<script setup
        lang="ts"
>
const testColor = ref("");

function logStuff() {
  console.log('testColor', { testColor });
}
</script>

<template>
  <div class="flex gap-4">
    <EyeDropper />
    <div>
      <input
        v-model="testColor"
        type="text"
      >
    </div>
    <div>
      <button
        class="btn btn-primary"
        @click="logStuff()"
      >
        LOG
      </button>
    </div>
    <div>
      {{ testColor }}
    </div>
  </div>
</template>

<style scoped></style>
