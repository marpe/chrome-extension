<script lang="ts"
        setup>
import { AddHighlight } from "@/composables/Highlight";
import { onKeyStroke } from "@vueuse/core";
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { sendMessage } from "webext-bridge/popup";
import type { Tabs } from "webextension-polyfill";

const inputText = ref("");

const tabs = ref<Tabs.Tab[]>([]);

const containerEl = useTemplateRef("containerEl");

/*const { hasFocus, activate, deactivate } = useFocusTrap(containerEl, {
	immediate: true,
});*/

const emit = defineEmits<{ hide: [] }>();

async function getTabs() {
	const response = await sendMessage(
		"ACTION",
		{ message: "Hello from MarpeBar" },
		"background",
	);

	tabs.value = response.tabs;
}

await getTabs();

const inputEl = useTemplateRef("inputEl");
const resultsEl = useTemplateRef("resultsEl");

function moveFocus(direction: "up" | "down") {
	const focused = resultsEl.value?.querySelector(":focus");
	if (!focused) {
		if (direction === "down") {
			const first = resultsEl.value?.firstElementChild as HTMLDivElement | null;
			first?.focus();
		} else {
			const last = resultsEl.value?.lastElementChild as HTMLDivElement | null;
			last?.focus();
		}
		return;
	}
	const nextEl =
		direction === "down"
			? focused.nextElementSibling ?? focused.parentElement?.firstElementChild
			: focused.previousElementSibling ??
				focused.parentElement?.lastElementChild;

	if (nextEl) {
		(nextEl as HTMLDivElement).focus();
	}
}

onKeyStroke(true, (e) => {
	if (e.type !== "keydown") {
		return;
	}

	if (e.key === "Shift" || e.key === "Control" || e.key === "Alt") {
		return;
	}

	if (
		e.key === "PageUp" ||
		e.key === "ArrowUp" ||
		(e.key === "Tab" && e.shiftKey)
	) {
		console.log("up", e);
		moveFocus("up");
		e.preventDefault();
	} else if (
		e.key === "PageDown" ||
		e.key === "ArrowDown" ||
		(e.key === "Tab" && !e.shiftKey)
	) {
		console.log("down", e);
		moveFocus("down");
		e.preventDefault();
	} else if (e.key === "Escape") {
		emit("hide");
		e.preventDefault();
	} else if (e.key === "Enter") {
		filteredTabs.value[0] && handleKeyDown(filteredTabs.value[0], e);
		emit("hide");
		e.preventDefault();
	} else {
		inputEl.value?.focus();
	}
});

onMounted(() => {
	console.log("mounted MarpeBar");
	inputEl.value?.focus();
});

onUnmounted(() => {
  console.log("unmounted MarpeBar");
});

async function handleKeyDown(
	tab: Pick<Tabs.Tab, "id" | "windowId">,
	e: KeyboardEvent,
) {
	if (e.key === "Enter") {
		const response = await sendMessage(
			"ACTIVATE_TAB",
			{ tabId: tab.id, windowId: tab.windowId },
			"background",
		);
	}
}

const filteredTabs = computed(() =>
	tabs.value
		.filter((tab) => {
			if (tab.active) {
				return false;
			}

			if (!inputText.value.length) {
				return true;
			}

			return (
				tab.title?.toLowerCase().includes(inputText.value.toLowerCase()) ||
				tab.url?.toLowerCase().includes(inputText.value.toLowerCase())
			);
		})
		.map((tab) => {
			if (inputText.value.length === 0) {
				return {
					...tab,
					highlighted: {
						title: tab.title ?? "",
						url: tab.url ?? "",
					},
				};
			}

			const regex = new RegExp(inputText.value, "gi");
			const highlighted = {
				title: AddHighlight(tab.title ?? "", regex, "green"),
				url: AddHighlight(tab.url ?? "", regex, "green"),
			};

			return {
				...tab,
				highlighted,
			};
		}),
);

const regexp = computed(() => new RegExp(inputText.value, "gi"));
</script>

<template>
  <div ref="containerEl" class="container">
    <input ref="inputEl"
           v-model="inputText"
           autocomplete="off"
           autofocus
           class="marpebar-input"
           spellcheck="false"
           type="text">
    <div ref="resultsEl" class="search-results">
      <div v-for="tab in filteredTabs" :key="tab.id" class="grid gap-x-2 gap-y-1 grid-cols-[40px,1fr] items-center" tabindex="0" @keydown="handleKeyDown(tab, $event)">
        <div class="search-result-type">
<!--          tab-->
        </div>
        <div class="tab-title" v-html="tab.highlighted.title" />
        <div class="tab-favicon-container">
          <img v-if="tab.favIconUrl" :src="tab.favIconUrl" alt="favicon" class="tab-favicon" height="16" width="16" />
        </div>
        <div class="tab-url" v-html="tab.highlighted.url" />
      </div>
    </div>
  </div>
</template>

<style scoped>

:global(.green) {
  color: var(--vimium-green);
}

.container {
  background: var(--vimium-base);
  border-color: var(--vimium-lavender);
  border-radius: 6px;
  border-width: 2px;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  max-height: 80dvh;
  opacity: 1;
  padding: 1rem;
  pointer-events: auto;

  transform: scale(1.0) translateY(0);
  transition: all 0.2s ease-out;
  width: clamp(320px, 80dvw, 100dvw - 2rem);

  @starting-style {
    transform: scale(0.9) translateY(30px);
    opacity: 0;
  }
}

.marpebar-input {
  background: var(--vimium-base);
  border: none;
  border-bottom: 1px solid var(--vimium-surface0);
  border-radius: 0;
  color: var(--vimium-lavender);
  font: inherit;
  font-size: 1.25rem;
  font-weight: 500;
  padding: 1rem 1rem;
  width: 100%;

  &:focus {
    outline: none;
  }
}

.tab-favicon {
  border: 1px solid var(--vimium-lavender);
}

.tab-title, .tab-url {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-title {
  color: var(--vimium-blue);
  font-weight: bold;
}

.tab-url {
  color: var(--vimium-lavender);
  font-size: 0.9rem;
}

.search-result-type {
  color: var(--vimium-peach);
}

.search-results {
  overflow-y: auto;

  > div {
    border-top: 1px solid var(--vimium-surface0);
    padding: 0.5rem;

    &:focus {
      background: var(--vimium-surface0);
      outline: none;
    }
  }
}

</style>