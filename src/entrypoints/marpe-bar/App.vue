<script lang="ts"
        setup>
import { onKeyStroke, useFocusWithin } from "@vueuse/core";
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from "vue";

onMounted(() => {
	console.log("mounted marpe app");
});

onUnmounted(() => {
	console.log("unmounted marpe app");
});

const showBar = ref(false);

onKeyStroke(
	["T"],
	(e) => {
		console.log("keydown", e);

		const ignoredTags = ["INPUT", "SELECT", "TEXTAREA"];
		const element = (e.target || e.srcElement) as HTMLElement | null;
		const tagName = element?.tagName;
		const isEditingText =
			(tagName && ignoredTags.includes(tagName)) || element?.isContentEditable;
		if (isEditingText) {
			return;
		}

		e.preventDefault();

		console.log("show");
		showBar.value = true;
	},
	{ eventName: "keydown" },
);

function onHide() {
	console.log("hide!");
	showBar.value = false;
}

const containerEl = useTemplateRef("containerEl");
</script>

<template>
  <div ref="containerEl" class="marpebar-container">
    <template v-if="showBar">
      <Suspense>
        <MarpeBar @hide="onHide" />
      </Suspense>
    </template>
  </div>
</template>

<style>
html {
  background: transparent !important;
  pointer-events: none;
}

.marpebar-container {
  align-items: start;
  display: grid;
  inset: 0;
  justify-content: center;
  margin-top: 10vh;
  position: fixed;
}

:root {
  --vimium-base: #1e1e2e;
  --vimium-blue: #89b4fa;
  --vimium-green: #a6e3a1;
  --vimium-lavender: #b4befe;
  --vimium-mantle: #181825;
  --vimium-peach: #fab387;
  --vimium-rosewater: #f5e0dc;
  --vimium-surface0: #313244;
  --vimium-surface2: #585b70;
  --vimium-text: #cdd6f4;
}
</style>
