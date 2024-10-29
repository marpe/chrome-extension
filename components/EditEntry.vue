<script lang="ts"
        setup>
import { useAppStore } from "@/stores/app.store";
import { getHighlighter } from "@/utils/shiki";
import type { CustomEntry } from "@/utils/state";
import { useDateFormat, useMagicKeys, useTimeAgo } from "@vueuse/core";
import { matchPattern } from "browser-extension-url-match";
import { type PropType, computed, ref, watch } from "vue";

const highlighter = await getHighlighter();

const store = useAppStore();

const model = defineModel({
	type: Object as PropType<CustomEntry>,
	required: true,
});

const emit = defineEmits<{
	save: [];
}>();

const formattedModifiedDateTime = useDateFormat(
	model.value.modified,
	"YYYY-MM-DD HH:mm",
);
const formattedCreatedDateTime = useDateFormat(
	model.value.created,
	"YYYY-MM-DD HH:mm",
);

const keys = useMagicKeys({
	passive: false,
	onEventFired: (event) => {
		if (event.key === "s" && event.ctrlKey && event.type === "keydown") {
			emit("save");
			event.preventDefault();
		}
	},
});

const styleVersion = ref(1);
const scriptVersion = ref(1);

const urlMatchPattern = computed(() => matchPattern(model.value.site));
const isSiteValid = computed(() => urlMatchPattern.value.valid);
const matcherError = computed(() =>
	!urlMatchPattern.value.valid ? urlMatchPattern.value.error : null,
);

const exampleUrls = [
	"https://youtube.com",
	"https://www.youtube.com",
	"https://youtube.com/watch?v=DVRg0daTads",
	"https://www.youtube.com/watch?v=DVRg0daTads",
];

const exampleMatches = computed(() => {
	return exampleUrls.map((url) => {
		return {
			url: url,
			matches: urlMatchPattern.value.valid
				? urlMatchPattern.value.match(url)
				: false,
		};
	});
});

/*const colorized = ref("");
const duration = ref(0);

watch(
	() => model.value.script,
	() => {
		console.log("highlighting");
		const start = performance.now();
		const result = highlighter.codeToHtml(model.value.script, {
			lang: "javascript",
			theme: "aurora-x",
		});
		const end = performance.now();
		duration.value = end - start;
		colorized.value = result;
	},
	{ immediate: true, flush: "post" },
);*/
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <div class="text-xs flex justify-between">
        <div>
          <span class="text-gray-400">Version: </span>
          {{ model.revision }}
        </div>
        <div>
          <span class="text-gray-400">Modified: </span>
          <span :title="formattedModifiedDateTime">
            {{ useTimeAgo(model.modified) }}
          </span>
        </div>
        <div>
          <span class="text-gray-400">Created: </span>
          {{ useDateFormat(model.created, "YYYY-MM-DD HH:mm") }}
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label for="description">Name</label>
        <input id="description"
               v-model="model.description"
               style="width: 100%" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="site">Site</label>
        <input id="site"
               v-model="model.site"
               :aria-invalid="!isSiteValid"
               style="width: 100%" />
      </div>


      <template v-if="store.showDebug">
        <div v-if="isSiteValid"
             class="flex flex-col gap-2"
             style="display: flex; flex-direction: row; align-items: center; flex-wrap: wrap; gap: 1rem; font-size: 0.75rem;">
          <div v-for="example in exampleMatches"
               style="display: flex; flex-direction: row; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>{{ example.matches ? '√' : '❌' }}</div>
            <div>{{ example.url }}</div>
          </div>
        </div>
        <div v-if="matcherError"
             class="flex flex-col gap-2">
          {{ matcherError.name }}: {{ matcherError.message }}
        </div>
      </template>

      <div class="flex flex-col gap-2">
        <label for="world">World</label>
        <select id="world"
                v-model="model.world"
                class="text-xs"
                style="width: 100%">
          <option value="USER_SCRIPT">USER_SCRIPT</option>
          <option value="MAIN">MAIN</option>
        </select>
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex flex-row items-center gap-4">
          <input id="enabled"
                 v-model="model.enabled"
                 :checked="model.enabled"
                 type="checkbox" />
          <label for="enabled">Enabled</label>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label for="runAt">Run at</label>
        <select id="runAt"
                v-model="model.runAt"
                class="text-xs"
                style="width: 100%">
          <option value="document_start">document_start</option>
          <option value="document_end">document_end</option>
          <option value="document_idle">document_idle</option>
        </select>
      </div>
    </div>

    <!--     <div>
          {{duration.toFixed(2)}}ms
        </div>

       <div class="relative overflow-hidden w-full flex-none">
          <div class="transition-all duration-500" v-html="colorized" />
          <textarea id="input"
                    v-model="model.script"
                    class="absolute inset-0 w-full h-full resize-none overflow-hidden p-4 caret-lime-400 font-mono bg-transparent text-transparent"
                    spellcheck="false" />
          <div class="opacity-50 absolute inset-0 pointer-events-none"/>
        </div>-->

    <div :style="{ flex: '0 1 0' }">
      <MonacoEditor v-model="model.script"
                    v-model:version="scriptVersion"
                    :initial="model.script"
                    language="javascript" />
    </div>

  </div>
</template>

<style>
.shiki, #input {
  border-color: #9ca3af4d;
  border-radius: .25rem;
  border-width: 1px;
  font-size: 14px;
  line-height: 1.5;
  min-height: 4em;
  padding: 1rem;
  white-space: pre;
}
</style>