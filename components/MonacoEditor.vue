<script lang="ts"
        setup>
import * as monaco from "monaco-editor";

import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
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

const keys = useMagicKeys();
const ctrlAltL = keys["Ctrl+Alt+L"];
watch(ctrlAltL, (value) => {
	if (value) {
		console.log("Formatting document");
		formatDocument();
	}
});
const ctrlShiftJ = keys["Ctrl+Shift+J"];
watch(ctrlShiftJ, (value) => {
	if (value) {
		console.log("Joining lines");
		joinLines();
	}
});

const joinLines = () => {
	editor?.getAction("editor.action.joinLines")?.run();
};

onMounted(() => {
	const settings: IStandaloneEditorConstructionOptions = {
		value: props.value.value,
		language: props.language,
		automaticLayout: true,
		scrollBeyondLastLine: false,
		lineNumbers: "off",
		minimap: { enabled: false },
		theme: "vs-dark",
		formatOnPaste: true,
		formatOnType: true,
		autoIndent: "full",
		fontFamily: "JetBrains Mono",
		fontLigatures: true,
		fontSize: 12,
		trimAutoWhitespace: true,
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

	adjustHeight();

	monaco.editor.defineTheme("one-dark", {
		base: "vs-dark",
		inherit: true,
		rules: [
			{ token: "", foreground: "ABB2BF", background: "282c34" }, // Default
			{ token: "invalid", foreground: "E05252" },
			{ token: "emphasis", fontStyle: "italic" },
			{ token: "strong", fontStyle: "bold" },

			{ token: "variable", foreground: "E06C75" },
			{ token: "variable.predefined", foreground: "4864AA" },
			{ token: "variable.parameter", foreground: "ABB2BF" },
			{ token: "constant", foreground: "D19A66" },
			{ token: "comment", foreground: "5C6370" },
			{ token: "number", foreground: "D19A66" },
			{ token: "number.hex", foreground: "5BB498" },
			{ token: "regexp", foreground: "56B6C2" },
			{ token: "annotation", foreground: "cc6666" },
			{ token: "type", foreground: "3DC9B0" },

			{ token: "delimiter", foreground: "DCDCDC" },
			{ token: "delimiter.html", foreground: "808080" },
			{ token: "delimiter.xml", foreground: "808080" },

			{ token: "tag", foreground: "E06C75" },
			{ token: "tag.id.jade", foreground: "4F76AC" },
			{ token: "tag.class.jade", foreground: "4F76AC" },
			{ token: "meta.scss", foreground: "A79873" },
			{ token: "meta.tag", foreground: "ABB2BF" },
			{ token: "metatag", foreground: "DD6A6F" },
			{ token: "metatag.content.html", foreground: "9CDCFE" },
			{ token: "metatag.html", foreground: "569CD6" },
			{ token: "metatag.xml", foreground: "569CD6" },
			{ token: "metatag.php", fontStyle: "bold" },

			{ token: "key", foreground: "9CDCFE" },
			{ token: "string.key.json", foreground: "9CDCFE" },
			{ token: "string.value.json", foreground: "CE9178" },

			{ token: "attribute.name", foreground: "9CDCFE" },
			{ token: "attribute.value", foreground: "CE9178" },
			{ token: "attribute.value.number.css", foreground: "B5CEA8" },
			{ token: "attribute.value.unit.css", foreground: "B5CEA8" },
			{ token: "attribute.value.hex.css", foreground: "D4D4D4" },

			{ token: "string", foreground: "98C379" },
			{ token: "string.sql", foreground: "FF0000" },

			{ token: "keyword", foreground: "C678DD" },
			{ token: "keyword.flow", foreground: "C586C0" },
			{ token: "keyword.json", foreground: "CE9178" },
			{ token: "keyword.flow.scss", foreground: "569CD6" },

			{ token: "operator.scss", foreground: "909090" },
			{ token: "operator.sql", foreground: "778899" },
			{ token: "operator.swift", foreground: "909090" },
			{ token: "predefined.sql", foreground: "FF00FF" },
		],
		colors: {
			"editor.background": "#282c34",
		},
	});

	monaco.editor.setTheme("one-dark");

	editor.onDidChangeModelContent(() => {
		const value = editor!.getValue();
		if (model.value !== undefined) {
			model.value = value;
		}
	});
});

const adjustHeight = () => {
	const contentHeight = editor!.getContentHeight();
	// const scrollHeight = editor!.getScrollHeight();
	// const scrollWidth = editor!.getScrollWidth();
	const monacoElRect = monacoEl.value!.getBoundingClientRect();
	const lineHeight = editor!.getOption(monaco.editor.EditorOption.lineHeight);
	const size = {
		height: Math.max(contentHeight + lineHeight * 2, monacoElRect.height),
		width: monacoElRect.width,
	};
	console.log("Settings editor size", size);
	editor!.layout(size);
};

watch(
	() => props.value,
	(newValue) => {
		editor!.setValue(newValue.value);
		adjustHeight();
	},
);

watch(
	() => props.disabled,
	(newValue) => {
		editor!.updateOptions({ readOnly: newValue });
	},
);

const formatDocument = () => {
	editor?.getAction("editor.action.formatDocument")?.run();
};
</script>

<template>
  <div class="monaco-container"
       style="min-height: 12rem; height: 100%; resize: vertical; overflow: hidden">
    <div ref="monacoEl"
         class="monaco-element"
         style="height: 100%; min-height: 0px" />
    <div>
      <button class="btn-icon" @click="formatDocument">
        <i-lucide-letter-text />
      </button>
    </div>
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
