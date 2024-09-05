<script lang="ts"
        setup>
import * as monaco from 'monaco-editor';

import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

type MonacoEditorProps = {
  value: string;
  setValue: (value: string) => void;
}

const props = defineProps({
  language: {
    required: true,
    type: String,
  },
  settings: {
    required: false,
    type: Object as PropType<MonacoEditorProps>,
    default: {
      value: "",
      setValue: (value: string) => {},
    },
  },
});

/*props.settings.setValue = (value: string) => {
  editor.value!.setValue(value);
};*/

const model = defineModel({ required: true, type: String });

const editor = ref<monaco.editor.IStandaloneCodeEditor | null>(null);

const monacoEl = ref<HTMLDivElement | null>(null);

self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
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

// monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

onMounted(() => {
  editor.value = monaco.editor.create(monacoEl.value!, {
    value: props.settings.value,
    language: props.language,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    lineNumbers: "off",
    theme: "vs-dark",
    fontSize: 12,
    folding: false,
    padding: {
      top: 0,
      bottom: 0,
    },
  });

  editor.value.onDidChangeModelContent(() => {
    const value = editor.value!.getValue();
    if (model.value !== value) {
      model.value = value;
    }
  });
});
</script>

<template>
  <div class="monaco-container"
       style="min-height: 10rem; resize: vertical; overflow: hidden">
    <div ref="monacoEl"
         style="height: 100%; min-height: 0px" />
  </div>
</template>

<style>
.monaco-container {
  display: grid;
  border: 1px solid #4e4e4e;
  border-radius: 4px;
}
</style>