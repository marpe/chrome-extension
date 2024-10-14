import type { CSSInjection, CustomEntry } from "@/utils/state";
import RegisteredUserScript = chrome.userScripts.RegisteredUserScript;

export const mapToScriptEntry = (entry: CustomEntry): RegisteredUserScript => ({
	id: entry.id,
	js: [{ code: entry.script }],
	matches: [`*://${entry.site}/*`],
	runAt: entry.runAt,
});

export const executeScript = async (entries: CustomEntry[]) => {
	const scriptIds = entries.map((entry) => entry.id);

	const scriptEntries = entries.map(mapToScriptEntry);

	const existingScripts = await chrome.userScripts.getScripts({
		ids: scriptIds,
	});

	const changes: {
		removed: string[];
		updated: string[];
		registered: string[];
	} = {
		removed: [],
		updated: [],
		registered: [],
	};

	for (const entry of scriptEntries) {
		const existing = existingScripts.find((script) => script.id === entry.id);
		if (existing) {
			await chrome.userScripts.update([entry]);
			changes.updated.push(entry.id);
		} else {
			await chrome.userScripts.register([entry]);
			changes.registered.push(entry.id);
		}
	}

	const removedScripts = existingScripts.filter(
		(script) => !scriptIds.includes(script.id),
	);

	for (const entry of removedScripts) {
		await chrome.userScripts.unregister({ ids: [entry.id] });
		changes.removed.push(entry.id);
	}

	return changes;
};

const queryTabs = async () => {
	try {
		return await chrome.tabs.query({});
	} catch (e) {
		console.error("Error querying tabs", e);
	}
	return [];
};

const tryRemoveCSS = async (injection: CSSInjection) => {
	try {
		await browser.scripting.removeCSS(injection);
		return true;
	} catch (e) {
		console.error(`Error removing CSS: ${e}`, { e, injection });
		return false;
	}
};

export const removeInjectedCSS = async (cssInjections: CSSInjection[]) => {
	try {
		await Promise.all(cssInjections.map(tryRemoveCSS));
	} catch (e) {
		console.error("Error removing CSS", e);
	}
};

export const tabFilter = (tab: chrome.tabs.Tab) => {
	if (tab.id === undefined) return false;
	if (!tab.url) return false;
	if (tab.url.startsWith("chrome://")) return false;
	if (tab.url.startsWith("chrome-extension://")) return false;
	return true;
};

export const injectCSS = async (entries: CustomEntry[]) => {
	try {
		const tabs = (await queryTabs()).filter(tabFilter);

		const css = entries.map((entry) => entry.style).join("\n");

		// const result = await chrome.permissions.request({
		// 	origins: ["*://*/*"],
		// 	permissions: ["scripting"],
		// });

		// console.log(`Permission request result: ${result}`);

		const cssInjections = tabs.map(({ id }) => {
			return {
				css: css,
				target: {
					tabId: id,
				},
			} as CSSInjection;
		});

		const injectionResults = await Promise.all(
			cssInjections.map(async (i) => {
				// const permissionRequestResult = await chrome.permissions.request({
				// 	origins: [`${new URL(tab.url!).origin}/*`],
				// 	permissions: ["scripting"],
				// });
				// console.log(`Request for ${tab.url}: ${permissionRequestResult}`);
				try {
					await chrome.scripting.insertCSS(i);
					return true;
				} catch (e) {
					const tab = await chrome.tabs.get(i.target.tabId);
					console.error(`Error injecting CSS (${tab.url}): ${e}`);
					return false;
				}
			}),
		);

		const successfulInjections: CSSInjection[] = [];
		const failedInjections: CSSInjection[] = [];

		for (let i = 0; i < injectionResults.length; i++) {
			if (!injectionResults[i]) {
				failedInjections.push(cssInjections[i]);
			} else {
				successfulInjections.push(cssInjections[i]);
			}
		}

		return { successfulInjections, failedInjections };
	} catch (e) {
		console.error("Error injecting CSS", e);
	}
	return { successfulInjections: [], failedInjections: [] };
};
