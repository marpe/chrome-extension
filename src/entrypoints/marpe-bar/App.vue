<script lang="ts"
        setup>
import { onKeyStroke, useEventListener, useFocusWithin } from "@vueuse/core";
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from "vue";

useEventListener(window, "message", (event: MessageEvent) => {
	console.log("marpe app received message", event.data);
	if (event.data.type === "keydown") {
		if (event.data.key === "T") {
			showBar.value = true;
		}
	}
});

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
		const ignoredTags = ["INPUT", "SELECT", "TEXTAREA"];
		const element = (e.target || e.srcElement) as HTMLElement | null;
		const tagName = element?.tagName;
		const isEditingText =
			(tagName && ignoredTags.includes(tagName)) || element?.isContentEditable;
		if (isEditingText) {
			return;
		}

		e.preventDefault();

		showBar.value = true;
	},
	{ eventName: "keydown" },
);

function onHide() {
	showBar.value = false;
}

onKeyStroke(
	["Escape"],
	(e) => {
		onHide();
	},
	{ eventName: "keydown" },
);

const containerEl = useTemplateRef("containerEl");

const { focused } = useFocusWithin(containerEl);

watch(focused, (value) => {
	if (!value) {
		onHide();
	}
});
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
