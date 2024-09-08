<script lang="ts"
        setup>
import * as monaco from "monaco-editor";

import { useTemplateRef } from "vue";
import IStandaloneEditorConstructionOptions = monaco.editor.IStandaloneEditorConstructionOptions;
import { setupMonaco } from "@/utils/monacoSetup";

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

let editor: monaco.editor.IStandaloneCodeEditor | null = null;

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

setupMonaco();

onMounted(() => {
	const settings: IStandaloneEditorConstructionOptions = {
		value: props.value.value,
		language: props.language,
		automaticLayout: true,
		scrollBeyondLastLine: false,
		lineNumbers: "off",
		minimap: { enabled: false },
		theme: "github-dark",
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
			top: 8,
			bottom: 8,
		},
	};

	if (!monacoEl.value) {
		throw new Error("Monaco editor element not found");
	}

	editor = monaco.editor.create(monacoEl.value, settings);

	adjustHeight();

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
