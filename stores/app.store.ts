import { createStorageItemRef } from "@/stores/createStorageItemRef";
import { createEntry } from "@/utils/createEntry";
import { type LogEntry, storageItems } from "@/utils/state";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed } from "vue";
import { useRouter } from "vue-router";

const clamp = (value: number, min: number, max: number) => {
	return Math.min(Math.max(value, min), max);
};

export const useAppStore = defineStore("app", () => {
	const items = {
		entries: createStorageItemRef(storageItems.entries, "entries"),
		logs: createStorageItemRef(storageItems.logs, "logs"),
	} as const;

	const loaded = computed(() => {
		return Object.values(items).every((s) => s.innerValue.loaded.value);
	});

	const addEntry = () => {
		const entry = createEntry(`New Entry ${items.entries.ref.value.length}`);
		items.entries.ref.value = [...items.entries.ref.value, entry];
		selectEntry(items.entries.ref.value.length - 1);
	};

	const removeEntry = (index: number) => {
		items.entries.ref.value = items.entries.ref.value.filter(
			(_, i) => i !== index,
		);
		const clamped = clamp(index, 0, items.entries.ref.value.length - 1);
		if (clamped !== index) {
			selectEntry(clamped);
		}
		console.log(
			`Removed entry, number of entries: ${items.entries.ref.value.length}`,
		);
	};

	const router = useRouter();

	const selectEntry = (index: number) => {
		const clampedIndex = clamp(index, 0, items.entries.ref.value.length - 1);
		// items.selectedIndex.ref.value = { value: clampedIndex };
		void router.push(`/options/${clampedIndex}`);
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
		loaded,
		...items,
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
