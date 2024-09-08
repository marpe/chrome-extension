<script lang="ts" setup>
import vueLogo from "@/public/vue.svg";
import { useAppStore } from "@/stores/app.store";

console.log("mounted app");

const store = useAppStore();

onKeyStroke(
	[" "],
	(e) => {
		console.log("[keydown] space pressed", e);
		const ignoredTags = ["INPUT", "SELECT", "TEXTAREA"];
		const element = (e.target || e.srcElement) as HTMLElement;
		const tagName = element?.tagName;
		if (tagName && !ignoredTags.includes(tagName)) {
			e.preventDefault();
			// e.stopPropagation();
			console.log("preventDefault");
		}
	},
	{ eventName: "keydown" },
);
</script>

<template>
  <div class="container">
    <img :src="vueLogo" alt="">
  </div>
</template>

<style scoped>
.container {
  position: fixed;
  right: 16px;
  top: 16px;
  width: 24px;
  height: 24px;
  pointer-events: none;
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
