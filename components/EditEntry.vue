<script lang="ts"
        setup>
import { matchPattern } from "browser-extension-url-match";
import type { CustomEntry } from "@/utils/state";
import { useDateFormat, useMagicKeys, useTimeAgo } from "@vueuse/core";
import { computed, PropType, ref } from "vue";

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
    if (event.key === "s" && event.ctrlKey) {
      emit("save");
      event.preventDefault();
    }
  },
});

const styleVersion = ref(1);
const scriptVersion = ref(1);

const urlMatchPattern = computed(() => matchPattern(model.value.site));
const isSiteValid = computed(() => urlMatchPattern.value.valid);
const matcherError = computed(() => !urlMatchPattern.value.valid ? urlMatchPattern.value.error : null);

const exampleUrls = ['https://youtube.com', 'https://www.youtube.com', 'https://youtube.com/watch?v=DVRg0daTads', 'https://www.youtube.com/watch?v=DVRg0daTads'];

const exampleMatches = computed(() => {
  return exampleUrls.map((url) => {
    return {
      url: url,
      matches: urlMatchPattern.value.valid ? urlMatchPattern.value.match(url) : false,
    }
  });
})

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

      <div v-if="isSiteValid"
           class="flex flex-col gap-2"
           style="display: flex; flex-direction: row; align-items: center; flex-wrap: wrap; gap: 1rem; font-size: 0.75rem;">
        <div v-for="example in exampleMatches"
             style="display: flex; flex-direction: row; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>{{ example.matches ? '✔️' : '❌' }}</div>
          <div>{{ example.url }}</div>
        </div>
      </div>
      <div v-if="matcherError"
           class="flex flex-col gap-2">
        {{ matcherError.name }}: {{ matcherError.message }}
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

    <div :style="{ flex: '0 1 0' }">
      <MonacoEditor v-model="model.script"
                    v-model:version="scriptVersion"
                    :initial="model.script"
                    language="javascript" />
    </div>

  </div>
</template>

<style>
</style>