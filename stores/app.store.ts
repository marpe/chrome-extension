import {
	type StorageItemRef,
	createStorageItemRef,
} from "@/stores/createStorageItemRef";
import { createEntry } from "@/utils/createEntry";
import {
	type CustomEntry,
	type CustomEntryId,
	type LogEntry,
	storageItems,
} from "@/utils/state";
import { type StorageLikeAsync, until } from "@vueuse/core";
import { acceptHMRUpdate, defineStore } from "pinia";
import { ref, toRaw } from "vue";
import { useRouter } from "vue-router";
import { storage } from "wxt/storage";

const clamp = (value: number, min: number, max: number) => {
	return Math.min(Math.max(value, min), max);
};

const syncStorage: StorageLikeAsync = {
	getItem: async (key: string) => {
		return await chrome.storage.sync.get(key);
	},
	setItem: async (key: string, value: string) => {
		await chrome.storage.sync.set({ [key]: value });
	},
	removeItem: async (key: string) => {
		await chrome.storage.sync.remove(key);
	},
};

export const useAppStore = defineStore("app", () => {
	const getItemsInSync = async () => {
		return await chrome.storage.sync.get();
	};

	const items = {
		entryIds: createStorageItemRef(storageItems.entryIds, "entries"),
		entries: new Map<string, StorageItemRef<CustomEntry>>(),
		logs: createStorageItemRef(storageItems.logs, "logs"),
	};

	let loaded = false;
	let isLoading = false;
	const loadData = async () => {
		if (loaded || isLoading) {
			return;
		}
		isLoading = true;
		await until(() => items.entryIds.innerValue.loaded.value).toBe(true);

		for (const id of items.entryIds.ref.value) {
			createStorageItemEntry(id);
		}

		await until(() =>
			items.entries.values().every((s) => s.innerValue.loaded.value),
		).toBe(true);
		loaded = true;
		isLoading = false;
	};

	const createStorageItemEntry = (id: string) => {
		const entryStorageItem = storage.defineItem<CustomEntry>(`sync:${id}`, {
			fallback: createEntry(`Entry not found ${id}`, id),
			init: () => createEntry(`New Entry ${id}`, id),
		});
		const entryStorageRef = createStorageItemRef(entryStorageItem, id);
		items.entries.set(id, entryStorageRef);
		return entryStorageRef;
	};

	const showDebug = ref<boolean>(true);

	type DataForExport = {
		entryIds: CustomEntryId[];
		entries: CustomEntry[];
	};

	const getDataForExport = () => {
		const data: DataForExport = {
			entryIds: toRaw(items.entryIds.ref.value),
			entries: Array.from(items.entries.values()).map((entry) =>
				toRaw(entry.ref.value),
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

	const importDataFromClipboard = async () => {
		try {
			const json = await navigator.clipboard.readText();
			const data = JSON.parse(json) as DataForExport;
			for (const id of data.entryIds) {
				if (!items.entryIds.ref.value.includes(id)) {
					items.entryIds.ref.value.push(id);
				}

				for (const entry of data.entries) {
					const siEntry = items.entries.get(id) ?? createStorageItemEntry(id);
					await siEntry!.storageItem.setValue(entry);
				}
			}
		} catch (e) {
			logError("Error importing data", e);
		}
	};

	const addEntry = () => {
		const entry = createEntry(`New Entry ${items.entryIds.ref.value.length}`);
		items.entryIds.ref.value.push(entry.id);
		createStorageItemEntry(entry.id);
		selectEntry(entry.id);
	};

	const removeEntry = async (entryId: string) => {
		const entryIdx = items.entryIds.ref.value.indexOf(entryId);
		if (entryIdx === -1) {
			logError(
				`Unexpected error while deleting entry: ${entryId}, the id wasn't found`,
			);
		} else {
			items.entryIds.ref.value.splice(entryIdx, 1);
		}

		const entry = items.entries.get(entryId);

		if (!entry) {
			logError(
				`Unexpected error while deleting entry: ${entryId}, the entry wasn't found`,
			);
			return;
		}

		await entry.storageItem.removeValue({ removeMeta: true });
		items.entries.delete(entryId);

		logInfo(
			`Removed entry, number of entries: ${items.entryIds.ref.value.length}`,
		);
	};

	const router = useRouter();

	const selectEntry = (entryId: string) => {
		void router.push(`/options/${entryId}`);
	};

	const clearLogs = () => {
		while (items.logs.ref.value.length > 0) {
			items.logs.ref.value.pop();
		}
	};

	const log = (
		severity: LogEntry["severity"],
		message: string,
		data?: LogEntry["data"],
	) => {
		addLog({ severity, message, data, timestamp: Date.now() });
	};

	const addLog = (l: LogEntry) => {
		items.logs.ref.value.push(l);
		while (items.logs.ref.value.length > 100) {
			items.logs.ref.value.shift();
		}
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
