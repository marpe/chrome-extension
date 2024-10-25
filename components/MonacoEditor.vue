<script lang="ts" setup>
import * as monaco from "monaco-editor";
import { onMounted, useTemplateRef, watch } from "vue";
import IStandaloneEditorConstructionOptions = monaco.editor.IStandaloneEditorConstructionOptions;
import { useDraggable, useMagicKeys } from "@vueuse/core";

const props = defineProps({
	language: {
		required: true,
		type: String,
	},
	initial: {
		type: String,
		required: true,
	},
	disabled: {
		required: false,
		type: Boolean,
		default: false,
	},
});

const model = defineModel({ type: String, default: "" });
const version = defineModel("version", { type: Number });

const monacoEl = useTemplateRef("monacoEl");
const resizeEl = useTemplateRef("resizeHandle");

useDraggable(resizeEl, {
	axis: "y",
	capture: true,
	preventDefault: true,
	stopPropagation: true,
	onMove: (event) => {
		if (!monacoEl.value || !editor) {
			return;
		}
		const monacoElRect = monacoEl.value.getBoundingClientRect();
		const newHeight = event.y - monacoElRect.y;
		// monacoEl.value!.style.height = `${newHeight}px`;
		editor.layout({
			width: editor.getLayoutInfo().width,
			height: Math.max(getMinHeight(), newHeight),
		});
	},
});

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

// setupMonaco();

onMounted(() => {
	const settings: IStandaloneEditorConstructionOptions = {
		value: model.value,
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
		fixedOverflowWidgets: true,
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
		if (!editor) {
			return;
		}
		// const numLines = editor!.getModel()?.getLineCount();
		// const cursorLine = editor!.getPosition()?.lineNumber;

		const hasScrollbar =
			editor.getLayoutInfo().height < editor.getContentHeight();

		if (!hasScrollbar) {
			adjustHeight(false);
		}

		model.value = editor.getValue();
		version.value = editor.getModel()?.getAlternativeVersionId() ?? 1;
	});
});

const getMinHeight = () => {
	if (!editor) {
		return 0;
	}
	const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
	return lineHeight * 12;
};

const adjustHeight = (allowShrink = false) => {
	if (!editor) {
		return;
	}
	// const scrollHeight = editor!.getScrollHeight();
	// const scrollWidth = editor!.getScrollWidth();
	const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);

	const contentHeight = Math.max(
		editor.getContentHeight() + lineHeight * 2,
		getMinHeight(),
	);
	const layoutInfo = editor.getLayoutInfo();

	const height = allowShrink
		? contentHeight
		: Math.max(contentHeight, layoutInfo.height);

	const size = {
		height: height,
		width: layoutInfo.width,
	};
	// console.log("Settings editor size", size);
	editor.layout(size);
};

watch(model, (newValue) => {
	const currentValue = editor?.getValue();
	if (currentValue === newValue) {
		return;
	}
	console.log("model value changed", { newValue, currentValue });
	editor?.setValue(newValue);
	adjustHeight();
});

watch(
	() => props.disabled,
	(newValue) => {
		editor?.updateOptions({ readOnly: newValue });
	},
);

const formatDocument = () => {
	editor?.getAction("editor.action.formatDocument")?.run();
};
</script>

<template>
    <div class="monaco-container">
        <div ref="monacoEl" class="monaco-element"  />
      <div ref="resizeHandle" class="resize-handle">

      </div>
        <div>
          <button class="btn-icon" title="Format document (CTRL+ALT+L)" @click="formatDocument">
            <i-lucide-letter-text />
          </button>
          <button class="btn-icon" title="Adjust size" @click="() => adjustHeight(true)">
            <i-lucide-scaling />
          </button>
        </div>
    </div>
</template>

<style>
.monaco-container {
    border: 1px solid #4e4e4e;
    border-radius: 4px;
    display: grid;
    grid-template-rows: 1fr 12px auto;
    overflow: hidden;

    &:focus-within {
      border-color: var(--brand);
    }
}

.monaco-element {
  min-height: 12rem;
  overflow: hidden;
  /*resize: vertical;*/
}

/*.monaco-editor {
  transition: height 0.2s ease-in-out;
}*/

.resize-handle {
  background-color: #111417;
  border-bottom: 1px solid #4e4e4e;
  cursor: row-resize;
}
</style>
