import * as monaco from "monaco-editor";

import { githubDark } from "@/utils/githubDark";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

let initialized = false;

export const setupMonaco = () => {
	if (initialized) {
		console.log("Monaco already initialized");
		return;
	}

	monaco.editor.defineTheme("github-dark", githubDark);

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

	initialized = true;
};
