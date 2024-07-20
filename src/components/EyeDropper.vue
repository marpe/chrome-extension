<script setup
        lang="ts"
>
let eyeDropper: EyeDropper | null = null

const pickedColor = ref('#000000');

async function openEyeDropper() {
  try {
    if (!eyeDropper) {
      eyeDropper = new window.EyeDropper();
    }
    const color = await eyeDropper.open();
    pickedColor.value = color.sRGBHex;
  } catch (e) {
    console.error(e);
    const err = e as Error;
    alert(`Error opening EyeDropper: ${err.message}`);
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
