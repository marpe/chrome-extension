import {
	type BundledLanguage,
	type BundledTheme,
	type HighlighterGeneric,
	createHighlighter,
} from "shiki";

let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null =
	null;

export async function getHighlighter() {
	if (highlighter) {
		return highlighter;
	}

	highlighter = await createHighlighter({
		themes: [
			"andromeeda",
			"aurora-x",
			"ayu-dark",
			"synthwave-84",
			"plastic",
			"vitesse-dark",
			"one-dark-pro",
			"github-dark",
		],
		langs: ["javascript"],
	});

	return highlighter;
}
