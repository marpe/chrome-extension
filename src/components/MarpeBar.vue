<script lang="ts"
        setup>
import { AddHighlight } from "@/composables/Highlight";
import { onClickOutside, onKeyStroke } from "@vueuse/core";
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import type { Tabs } from "webextension-polyfill";
import { sendMessage } from "webext-bridge/content-script";

const inputText = ref("");

const tabs = ref<Tabs.Tab[]>([]);

const containerEl = useTemplateRef("containerEl");

/*const { hasFocus, activate, deactivate } = useFocusTrap(containerEl, {
	immediate: true,
});*/

const emit = defineEmits<{ hide: [] }>();

async function getTabs() {
	// const response = await chrome.runtime.sendMessage("GET_TABS");
	const response = await sendMessage("GET_TABS", {}, "background");

	tabs.value = response.tabs.toSorted(
		(tab1, tab2) => (tab2?.lastAccessed ?? 0) - (tab1?.lastAccessed ?? 0),
	);
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
			? focused.nextElementSibling ?? inputEl.value
			: focused.previousElementSibling ?? inputEl.value;

	if (nextEl) {
		(nextEl as HTMLDivElement).focus();
	}
}

onClickOutside(containerEl, () => {
	emit("hide");
});

onKeyStroke((e) => {
	if (e.type !== "keydown") {
		return;
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
	if (
		e.key === "Shift" ||
		e.key === "Control" ||
		e.key === "Alt" ||
		e.key === "Meta"
	) {
		return;
	}

	if (e.key === "Escape") {
		emit("hide");
		e.preventDefault();
	} else if (
		e.key === "PageUp" ||
		e.key === "ArrowUp" ||
		(e.key === "Tab" && e.shiftKey)
	) {
		moveFocus("up");
		e.preventDefault();
	} else if (
		e.key === "PageDown" ||
		e.key === "ArrowDown" ||
		(e.key === "Tab" && !e.shiftKey)
	) {
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
		await activateTab(tab);
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

async function handleClick(
	tab: Pick<Tabs.Tab, "id" | "windowId">,
	e: MouseEvent,
) {
	await activateTab(tab);
	emit("hide");
}

async function activateTab(tab: Pick<Tabs.Tab, "id" | "windowId">) {
	const response = await sendMessage(
		"ACTIVATE_TAB",
		{ tabId: tab.id, windowId: tab.windowId },
		"background",
	);
}
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
      <div v-for="tab in filteredTabs"
           :key="tab.id"
           class="grid gap-x-2 gap-y-1 grid-cols-[40px,1fr] items-center"
           tabindex="0"
           @click="handleClick(tab, $event)"
           @keydown="handleKeyDown(tab, $event)">
        <div class="search-result-type">
<!--          tab-->
        </div>

        <div class="tab-favicon-container">
          <template v-if="tab.favIconUrl">
            <img v-if="tab.favIconUrl" :src="tab.favIconUrl" alt="favicon" class="tab-favicon" height="24" width="24" />
          </template>
          <template v-else>
              <div class="tab-favicon tab-favicon-fallback text-gray-900">
                <i-lucide-star />
              </div>
          </template>
        </div>

        <div class="tab-header">
          <div class="tab-top flex-split">
            <div class="tab-title" v-html="tab.highlighted.title" />
            <div><RelativeDate :value="tab.lastAccessed" /></div>
          </div>
          <div class="tab-subheader flex-split">
            <div class="tab-url" v-html="tab.highlighted.url" />
            <div class="tab-window">{{tab.windowId}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

:global(.green) {
  color: var(--vimium-green);
}

.container {
  background-color: var(--vimium-base);
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
  background-color: var(--vimium-base);
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

.tab-favicon-fallback {
  background-color: var(--vimium-lavender) !important;
}

.tab-favicon, .tab-favicon-fallback {
  /*border: 1px solid var(--vimium-lavender);*/
  align-items: center;
  display: flex;

  height: 24px;
  justify-content: center;
  width: 24px;
}

.tab-title, .tab-url {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-header {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.flex-split {
  align-items: start;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.tab-title {
  color: var(--vimium-blue);
  font-weight: bold;
  overflow: hidden;
}

.tab-url {
  color: var(--vimium-lavender);
  font-size: 0.9rem;
  overflow: hidden;
}

.search-result-type {
  color: var(--vimium-peach);
}

.search-results {
  overflow-x: clip;
  overflow-y: auto;

  > div {
    border-top: 1px solid var(--vimium-surface0);
    padding: 0.5rem;

    &:focus {
      background-color: var(--vimium-surface0);
      outline: none;
    }
  }
}

.tab-window {
  color: oklch(from currentColor calc(l - 0.4) c h);
}

.tab-favicon-container, .search-result-type {
  align-items: center;
  display: flex;
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  justify-content: center;

  .tab-favicon {
    border-radius: 5px;
  }
}

</style>