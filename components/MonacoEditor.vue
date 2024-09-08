<script lang="ts"
        setup>
import * as monaco from 'monaco-editor';

import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import IStandaloneEditorConstructionOptions = monaco.editor.IStandaloneEditorConstructionOptions;
import { useTemplateRef } from "vue";

interface MonacoEditorProps {
  value: string;
}

const props = defineProps({
  language: {
    required: true,
    type: String,
  },
  value: {
    type: Object as PropType<MonacoEditorProps>,
    required: true,
  },
  disabled: {
    required: false,
    type: Boolean,
    default: false,
  },
});

const model = defineModel({ type: String });

const monacoEl = useTemplateRef("monacoEl");

self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === "json") {
      return new JsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new CssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new HtmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new TsWorker();
    }
    return new EditorWorker();
  },
};

/*useEventListener(window, "resize", () => {
  if (editor) {
    const { width, height } = monacoEl.value!.getBoundingClientRect();
    editor.layout({ width, height });
  }
});*/

// monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

let editor: monaco.editor.IStandaloneCodeEditor | null = null;

/*useResizeObserver(monacoEl, (entries) => {
  const entry = entries[0];
  const { width, height } = entry.contentRect;
  if (editor) {
    console.log("Resizing Monaco editor", width, height);
    editor.layout({ width, height });
  }
});*/

onMounted(() => {
  const settings: IStandaloneEditorConstructionOptions = {
    value: props.value.value,
    language: props.language,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    lineNumbers: "off",
    minimap: { enabled: false },
    theme: "vs-dark",
    fontSize: 12,
    scrollbar: {
      alwaysConsumeMouseWheel: false,
    },
    folding: false,
    readOnly: props.disabled,
    padding: {
      top: 0,
      bottom: 0,
    },
  };

  if (!monacoEl.value) {
    throw new Error("Monaco editor element not found");
  }

  editor = monaco.editor.create(monacoEl.value, settings);

  editor.onDidChangeModelContent(() => {
    const value = editor!.getValue();
    if (model.value !== undefined) {
      model.value = value;
    }
  });
});

watch(() => props.value, (newValue) => {
  editor!.setValue(newValue.value);
});

watch(() => props.disabled, (newValue) => {
  editor!.updateOptions({ readOnly: newValue });
});
</script>

<template>
  <div class="monaco-container"
       style="min-height: 10rem; height: 100%; resize: vertical; overflow: hidden">
    <div ref="monacoEl"
         class="monaco-element"
         style="height: 100%; min-height: 0px" />
  </div>
</template>

<style>
.monaco-container {
  display: grid;
  border: 1px solid #4e4e4e;
  border-radius: 4px;
}

.monaco-element {
  overflow: clip;
}
</style>