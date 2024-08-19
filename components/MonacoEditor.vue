<script lang="ts" setup>
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const model = defineModel({ default: "", required: false, type: String });

const monacoEl = ref<HTMLDivElement>();

onMounted(() => {
  console.log(model);
  const editor = monaco.editor.create(monacoEl.value!, {
    value: model.value,
    language: "typescript",
    automaticLayout: true,
    theme: "vs-dark",
    padding: {
      top: 20,
      bottom: 20,
    },
  });

  editor.onDidChangeModelContent(() => {
    const value = editor.getValue();
    if (model.value !== value) {
      model.value = value;
    }
  });
});
</script>

<template>
  <div class="monaco-container" style="min-height: 200px; resize: vertical; overflow: hidden">
    <div ref="monacoEl" style="height: 100%; min-height: 0px" />
  </div>
</template>
