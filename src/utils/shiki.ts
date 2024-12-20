import {
	type BundledLanguage,
	type BundledTheme,
	type HighlighterGeneric,
	createHighlighter,
} from "shiki";

let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null =
	null;

let highlighterPromise: Promise<
	HighlighterGeneric<BundledLanguage, BundledTheme>
> | null = null;

export async function getHighlighter() {
	if (highlighterPromise) {
		return highlighterPromise;
	}

	console.log("Creating highlighter");

	highlighterPromise = createHighlighter({
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
	}).then((h) => {
		highlighter = h;
		return highlighter;
	});

	return highlighterPromise;
}
