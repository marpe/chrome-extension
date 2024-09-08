<script lang="ts"
        setup>
import * as monaco from "monaco-editor";

import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { useTemplateRef } from "vue";
import IStandaloneEditorConstructionOptions = monaco.editor.IStandaloneEditorConstructionOptions;

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
		overviewRulerLanes: 0,
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

	monaco.editor.defineTheme("github-dark", {
		base: "vs-dark",
		inherit: true,
		rules: [
			{
				background: "24292e",
				token: "",
			},
			{
				foreground: "959da5",
				token: "comment",
			},
			{
				foreground: "959da5",
				token: "punctuation.definition.comment",
			},
			{
				foreground: "959da5",
				token: "string.comment",
			},
			{
				foreground: "c8e1ff",
				token: "constant",
			},
			{
				foreground: "c8e1ff",
				token: "entity.name.constant",
			},
			{
				foreground: "c8e1ff",
				token: "variable.other.constant",
			},
			{
				foreground: "c8e1ff",
				token: "variable.language",
			},
			{
				foreground: "b392f0",
				token: "entity",
			},
			{
				foreground: "b392f0",
				token: "entity.name",
			},
			{
				foreground: "f6f8fa",
				token: "variable.parameter.function",
			},
			{
				foreground: "7bcc72",
				token: "entity.name.tag",
			},
			{
				foreground: "ea4a5a",
				token: "keyword",
			},
			{
				foreground: "ea4a5a",
				token: "storage",
			},
			{
				foreground: "ea4a5a",
				token: "storage.type",
			},
			{
				foreground: "f6f8fa",
				token: "storage.modifier.package",
			},
			{
				foreground: "f6f8fa",
				token: "storage.modifier.import",
			},
			{
				foreground: "f6f8fa",
				token: "storage.type.java",
			},
			{
				foreground: "79b8ff",
				token: "string",
			},
			{
				foreground: "79b8ff",
				token: "punctuation.definition.string",
			},
			{
				foreground: "79b8ff",
				token: "string punctuation.section.embedded source",
			},
			{
				foreground: "c8e1ff",
				token: "support",
			},
			{
				foreground: "c8e1ff",
				token: "meta.property-name",
			},
			{
				foreground: "fb8532",
				token: "variable",
			},
			{
				foreground: "f6f8fa",
				token: "variable.other",
			},
			{
				foreground: "d73a49",
				fontStyle: "bold italic underline",
				token: "invalid.broken",
			},
			{
				foreground: "d73a49",
				fontStyle: "bold italic underline",
				token: "invalid.deprecated",
			},
			{
				foreground: "fafbfc",
				background: "d73a49",
				fontStyle: "italic underline",
				token: "invalid.illegal",
			},
			{
				foreground: "fafbfc",
				background: "d73a49",
				fontStyle: "italic underline",
				token: "carriage-return",
			},
			{
				foreground: "d73a49",
				fontStyle: "bold italic underline",
				token: "invalid.unimplemented",
			},
			{
				foreground: "d73a49",
				token: "message.error",
			},
			{
				foreground: "f6f8fa",
				token: "string source",
			},
			{
				foreground: "c8e1ff",
				token: "string variable",
			},
			{
				foreground: "79b8ff",
				token: "source.regexp",
			},
			{
				foreground: "79b8ff",
				token: "string.regexp",
			},
			{
				foreground: "79b8ff",
				token: "string.regexp.character-class",
			},
			{
				foreground: "79b8ff",
				token: "string.regexp constant.character.escape",
			},
			{
				foreground: "79b8ff",
				token: "string.regexp source.ruby.embedded",
			},
			{
				foreground: "79b8ff",
				token: "string.regexp string.regexp.arbitrary-repitition",
			},
			{
				foreground: "7bcc72",
				fontStyle: "bold",
				token: "string.regexp constant.character.escape",
			},
			{
				foreground: "c8e1ff",
				token: "support.constant",
			},
			{
				foreground: "c8e1ff",
				token: "support.variable",
			},
			{
				foreground: "c8e1ff",
				token: "meta.module-reference",
			},
			{
				foreground: "fb8532",
				token: "markup.list",
			},
			{
				foreground: "0366d6",
				fontStyle: "bold",
				token: "markup.heading",
			},
			{
				foreground: "0366d6",
				fontStyle: "bold",
				token: "markup.heading entity.name",
			},
			{
				foreground: "c8e1ff",
				token: "markup.quote",
			},
			{
				foreground: "f6f8fa",
				fontStyle: "italic",
				token: "markup.italic",
			},
			{
				foreground: "f6f8fa",
				fontStyle: "bold",
				token: "markup.bold",
			},
			{
				foreground: "c8e1ff",
				token: "markup.raw",
			},
			{
				foreground: "b31d28",
				background: "ffeef0",
				token: "markup.deleted",
			},
			{
				foreground: "b31d28",
				background: "ffeef0",
				token: "meta.diff.header.from-file",
			},
			{
				foreground: "b31d28",
				background: "ffeef0",
				token: "punctuation.definition.deleted",
			},
			{
				foreground: "176f2c",
				background: "f0fff4",
				token: "markup.inserted",
			},
			{
				foreground: "176f2c",
				background: "f0fff4",
				token: "meta.diff.header.to-file",
			},
			{
				foreground: "176f2c",
				background: "f0fff4",
				token: "punctuation.definition.inserted",
			},
			{
				foreground: "b08800",
				background: "fffdef",
				token: "markup.changed",
			},
			{
				foreground: "b08800",
				background: "fffdef",
				token: "punctuation.definition.changed",
			},
			{
				foreground: "2f363d",
				background: "959da5",
				token: "markup.ignored",
			},
			{
				foreground: "2f363d",
				background: "959da5",
				token: "markup.untracked",
			},
			{
				foreground: "b392f0",
				fontStyle: "bold",
				token: "meta.diff.range",
			},
			{
				foreground: "c8e1ff",
				token: "meta.diff.header",
			},
			{
				foreground: "0366d6",
				fontStyle: "bold",
				token: "meta.separator",
			},
			{
				foreground: "0366d6",
				token: "meta.output",
			},
			{
				foreground: "ffeef0",
				token: "brackethighlighter.tag",
			},
			{
				foreground: "ffeef0",
				token: "brackethighlighter.curly",
			},
			{
				foreground: "ffeef0",
				token: "brackethighlighter.round",
			},
			{
				foreground: "ffeef0",
				token: "brackethighlighter.square",
			},
			{
				foreground: "ffeef0",
				token: "brackethighlighter.angle",
			},
			{
				foreground: "ffeef0",
				token: "brackethighlighter.quote",
			},
			{
				foreground: "d73a49",
				token: "brackethighlighter.unmatched",
			},
			{
				foreground: "d73a49",
				token: "sublimelinter.mark.error",
			},
			{
				foreground: "fb8532",
				token: "sublimelinter.mark.warning",
			},
			{
				foreground: "6a737d",
				token: "sublimelinter.gutter-mark",
			},
			{
				foreground: "79b8ff",
				fontStyle: "underline",
				token: "constant.other.reference.link",
			},
			{
				foreground: "79b8ff",
				fontStyle: "underline",
				token: "string.other.link",
			},
		],
		colors: {
			"editor.foreground": "#f6f8fa",
			"editor.background": "#24292e",
			"editor.selectionBackground": "#4c2889",
			"editor.inactiveSelectionBackground": "#444d56",
			"editor.lineHighlightBackground": "#444d56",
			"editorCursor.foreground": "#ffffff",
			"editorWhitespace.foreground": "#6a737d",
			"editorIndentGuide.background": "#6a737d",
			"editorIndentGuide.activeBackground": "#f6f8fa",
			"editor.selectionHighlightBorder": "#444d56",
		},
	});

	monaco.editor.setTheme("github-dark");

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
