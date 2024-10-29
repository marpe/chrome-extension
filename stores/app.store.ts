import {
	type UseStoredValueReturn,
	useStoredValue,
} from "@/composables/useStoredValue";
import { createEntry } from "@/utils/createEntry";
import type { CustomEntry, CustomEntryId, LogEntry } from "@/utils/state";
import { until } from "@vueuse/core";
import { nanoid } from "nanoid";
import { acceptHMRUpdate, defineStore } from "pinia";
import { ref, shallowRef, toRaw } from "vue";
import { useRouter } from "vue-router";
import { storage } from "wxt/storage";

export const useAppStore = defineStore("app", () => {
	const getItemsInSync = async () => {
		return await chrome.storage.sync.get();
	};

	const items = {
		entryIds: useStoredValue<string[]>("sync:entryIds", [], {
			onError: (e) => logError(`${e}`, e),
		}),
		entries: shallowRef<Record<string, UseStoredValueReturn<CustomEntry>>>({}),
		logs: useStoredValue<LogEntry[]>("local:logs", [], {
			onError: (e) => logError(`${e}`, e),
		}),
	};

	let loaded = false;
	let isLoading = false;
	const loadData = async () => {
		if (loaded || isLoading) {
			return;
		}
		isLoading = true;
		await until(() => items.entryIds.isLoading.value).toBe(false);

		console.log("Loading ids", items.entryIds.state.value);

		for (const id of items.entryIds.state.value) {
			createStorageItemEntry(id);
		}

		console.log(
			"Loading entries",
			Object.values(items.entries.value).map((e) => e.state.value),
		);

		await until(() =>
			Object.values(items.entries.value)
				.map((e) => e.isReady.value)
				.every((r) => r),
		).toBe(true);
		loaded = true;
		isLoading = false;
		console.log("Data loaded", items.entries);
	};

	const createStorageItemEntry = (id = `script-${nanoid()}`) => {
		const entryStorageRef = useStoredValue<CustomEntry>(
			`sync:${id}`,
			createEntry(`New Entry ${id}`, id),
			{ onError: (e) => logError(`${e}`, e) },
		);
		items.entries.value = {
			...items.entries.value,
			[id]: entryStorageRef,
		};
		return entryStorageRef;
	};

	const showDebug = ref<boolean>(true);

	type DataForExport = {
		entryIds: CustomEntryId[];
		entries: CustomEntry[];
	};

	const getDataForExport = () => {
		const data: DataForExport = {
			entryIds: toRaw(items.entryIds.state.value),
			entries: Object.values(items.entries.value).map((entry) =>
				toRaw(entry.state.value),
			),
		};
		return JSON.stringify(data, null, 2);
	};

	const downloadData = async () => {
		try {
			const json = getDataForExport();
			const blob = new Blob([json], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "marpe-chrome-extension-scripts.json";
			a.click();
			URL.revokeObjectURL(url);
		} catch (e) {
			logError("Error downloading data", e);
		}
	};

	const exportDataToClipboard = async () => {
		try {
			const json = getDataForExport();
			await navigator.clipboard.writeText(json);
			console.log("Copied to clipboard");
		} catch (e) {
			logError("Error exporting data", e);
		}
	};

	const importPresets = async (presets: {
		entries: Pick<CustomEntry, "description" | "script">[];
	}) => {
		console.log("Adding preset", presets);
		const addedEntries = Array.from({ length: presets.entries.length }, () =>
			addEntry(),
		);
		await until(() => addedEntries.every((e) => e.isReady.value)).toBe(true);
		addedEntries.forEach((entry, idx) => {
			const newValue = {
				...entry.state.value,
				...presets.entries[idx],
			};
			console.log("Setting entry", idx, newValue);
			entry.state.value = newValue;
		});
	};

	const importDataFromClipboard = async () => {
		try {
			const json = await navigator.clipboard.readText();
			const data = JSON.parse(json) as DataForExport;
			for (const id of data.entryIds) {
				if (!items.entryIds.state.value.includes(id)) {
					items.entryIds.state.value = [...items.entryIds.state.value, id];
				}
			}

			for (const entry of data.entries) {
				const siEntry =
					items.entries.value[entry.id] ?? createStorageItemEntry(entry.id);
				siEntry.state.value = entry;
			}
		} catch (e) {
			logError("Error importing data", e);
		}
	};

	const addEntry = () => {
		const entryId = `script-${nanoid()}`;
		items.entryIds.state.value = [...items.entryIds.state.value, entryId];
		console.log("Adding entry", entryId);
		return createStorageItemEntry(entryId);
	};

	const removeEntry = async (entryId: string) => {
		const entryIdx = items.entryIds.state.value.indexOf(entryId);
		if (entryIdx === -1) {
			logError(
				`Unexpected error while deleting entry: ${entryId}, the id wasn't found`,
			);
		} else {
			items.entryIds.state.value = [
				...items.entryIds.state.value.slice(0, entryIdx),
				...items.entryIds.state.value.slice(entryIdx + 1),
			];
		}

		const entry = items.entries.value[entryId];

		if (!entry) {
			logError(
				`Unexpected error while deleting entry: ${entryId}, the entry wasn't found`,
			);
			return;
		}

		await storage.removeItem(`sync:${entryId}`, { removeMeta: true });
		items.entries.value = Object.fromEntries(
			Object.entries(items.entries.value).filter(([id]) => id !== entryId),
		);

		logInfo(
			`Removed entry, number of entries: ${items.entryIds.state.value.length}`,
		);
	};

	const router = useRouter();

	const selectEntry = (entryId: string) => {
		void router.push(`/options/${entryId}`);
	};

	const clearLogs = () => {
		items.logs.state.value = [];
	};

	const log = (
		severity: LogEntry["severity"],
		message: string,
		data?: LogEntry["data"],
	) => {
		addLog({ severity, message, data, timestamp: Date.now() });
	};

	const addLog = (l: LogEntry) => {
		items.logs.state.value = [...items.logs.state.value, l];
		if (l.severity === "error") {
			console.error(l.message, l.data);
		} else if (l.severity === "warn") {
			console.warn(l.message, l.data);
		} else {
			console.log(l.message, l.data);
		}
	};

	const logInfo = (message: string, data?: LogEntry["data"]) => {
		log("info", message, data);
	};
	const logError = (message: string, data?: LogEntry["data"]) => {
		log("error", message, data);
	};
	const logWarn = (message: string, data?: LogEntry["data"]) => {
		log("warn", message, data);
	};
	const logDebug = (message: string, data?: LogEntry["data"]) => {
		log("debug", message, data);
	};

	return {
		exportDataToClipboard,
		importDataFromClipboard,
		downloadData,
		loadData,
		importPresets,
		entryIds: items.entryIds,
		entries: items.entries,
		logs: items.logs,
		showDebug,
		removeEntry,
		selectEntry,
		addEntry,
		log,
		logDebug,
		logError,
		logInfo,
		logWarn,
		clearLogs,
	} as const;
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot));
}
