import { resolve } from "node:path";
import { defineRunnerConfig } from "wxt";

export default defineRunnerConfig({
	chromiumProfile: resolve(".wxt/chrome-data"),
	keepProfileChanges: true,
	startUrls: ["https://www.google.com", "https://www.svt.se"],
	binaries: {
		// chrome: "C:/Program Files/Google/Chrome/Application/chrome.exe",
		chrome: `${import.meta.env.LOCALAPPDATA}/Google/Chrome SxS/Application/chrome.exe`,
	},
});
