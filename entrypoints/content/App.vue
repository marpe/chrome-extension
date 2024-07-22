<script lang="ts" setup>
import vueLogo from "@/assets/vue.svg";
</script>

<template>
  <div class="container">
    <img :src="vueLogo">
  </div>
</template>

<style scoped>
.container {
  position: fixed;
  right: 16px;
  top: 16px;
  width: 24px;
  height: 24px;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  border-radius: 8px;
  color: #cecece;
  z-index: 999999;
}

img {
  width: 24px;
}
</style>
