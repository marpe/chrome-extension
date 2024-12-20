import type { CustomEntry } from "@/utils/state";
import { matchPattern } from "browser-extension-url-match";
import RegisteredUserScript = chrome.userScripts.RegisteredUserScript;

export const mapToScriptEntry = (entry: CustomEntry): RegisteredUserScript => ({
	id: entry.id,
	js: [{ code: entry.script }],
	world: entry.world,
	allFrames: entry.allFrames,
	matches: [entry.site],
	runAt: entry.runAt,
});

function hasValidMatchPattern(entry: CustomEntry) {
	const valid = matchPattern(entry.site).valid;
	if (!valid) {
		console.warn(`Invalid match pattern: ${entry.site}`);
	}
	return valid;
}

export const updateUserScripts = async (entries: CustomEntry[]) => {
	const scriptEntries = entries
		.filter((e) => e.enabled)
		.filter(hasValidMatchPattern)
		.map(mapToScriptEntry);

	const scriptIds = scriptEntries.map((entry) => entry.id);

	const existingScripts = await chrome.userScripts.getScripts();

	const changes: {
		removed: string[];
		updated: string[];
		unchanged: string[];
		registered: string[];
	} = {
		removed: [],
		updated: [],
		unchanged: [],
		registered: [],
	};

	for (const entry of scriptEntries) {
		const existing = existingScripts.find((script) => script.id === entry.id);
		if (existing) {
			if (
				existing.js &&
				existing.js.length > 0 &&
				existing.runAt === entry.runAt &&
				existing.js[0].code === entry.js[0].code &&
				existing.allFrames === entry.allFrames &&
				existing.world === entry.world
			) {
				changes.unchanged.push(entry.id);
			} else {
				await chrome.userScripts.update([entry]);
				changes.updated.push(entry.id);
			}
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
