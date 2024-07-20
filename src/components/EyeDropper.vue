<script setup lang="ts">
const eyeDropper = useEyeDropper()
const pickedColor = ref('#000000')

async function openEyeDropper() {
  try {
    const color = await eyeDropper.open()
    if (color) {
      pickedColor.value = color?.sRGBHex
    }
  } catch (e) {
    console.error(e)
    const err = e as Error
    alert(`Error opening EyeDropper: ${err.message}`)
  }
}
</script>

<template>
  <div>
    <button
      class="btn btn-primary"
      @click="openEyeDropper()"
    >
      🎨
    </button>
    <div>{{ pickedColor }}</div>
  </div>
</template>
