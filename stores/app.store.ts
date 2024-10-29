import {
	type StorageItemRef,
	createStorageItemRef,
} from "@/stores/createStorageItemRef";
import { createEntry } from "@/utils/createEntry";
import { type CustomEntry, type LogEntry, storageItems } from "@/utils/state";
import { type StorageLikeAsync, until } from "@vueuse/core";
import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
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
	};

	const showDebug = ref<boolean>(true);

	const addEntry = () => {
		const entry = createEntry(`New Entry ${items.entryIds.ref.value.length}`);
		items.entryIds.ref.value = [...items.entryIds.ref.value, entry.id];
		createStorageItemEntry(entry.id);
		selectEntry(entry.id);
	};

	const removeEntry = async (entryId: string) => {
		const hasEntry = items.entryIds.ref.value.includes(entryId);
		if (!hasEntry) {
			logError(
				`Unexpected error while deleting entry: ${entryId}, the id wasn't found`,
			);
		} else {
			items.entryIds.ref.value = items.entryIds.ref.value.filter(
				(id, _) => id !== entryId,
			);
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
		items.logs.ref.value = [];
	};

	const log = (
		severity: LogEntry["severity"],
		message: string,
		data?: LogEntry["data"],
	) => {
		addLog({ severity, message, data, timestamp: Date.now() });
	};

	const addLog = (l: LogEntry) => {
		items.logs.ref.value = [...items.logs.ref.value, l];
		while (items.logs.ref.value.length > 100) {
			items.logs.ref.value = items.logs.ref.value.slice(1);
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
