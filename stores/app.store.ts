import { createEntry } from "@/utils/createEntry";
import {
	type CSSInjection,
	type Entry,
	type LogEntry,
	StorageKey,
	storageItems,
} from "@/utils/state";
import type { Unwatch, WxtStorageItem } from "wxt/storage";

const clamp = (value: number, min: number, max: number) => {
	return Math.min(Math.max(value, min), max);
};

// biome-ignore lint/complexity/noBannedTypes: <explanation>
function createItemBackedRef<T, M extends Record<string, unknown> = {}>(
	storageItem: WxtStorageItem<T, M>,
) {
	const innerValue: {
		value: T;
		loaded: Ref<boolean>;
		watcher: Unwatch | null;
	} = {
		value: storageItem.fallback,
		loaded: ref(false),
		watcher: null,
	};

	const valueRef = customRef((track, trigger) => {
		const addWatcher = () => {
			innerValue.watcher = storageItem.watch((v) => {
				innerValue.value = v;
				trigger();
			});
		};

		const removeWatcher = () => {
			console.log("removing watcher");
			innerValue.watcher?.();
			innerValue.watcher = null;
		};

		storageItem.getValue().then((v) => {
			console.log("loaded initial value", v);
			innerValue.value = v;
			innerValue.loaded.value = true;
			trigger();
			addWatcher();
		});

		return {
			get() {
				track();
				return innerValue.value;
			},
			set(newValue: T) {
				console.log("setting", newValue);
				removeWatcher();
				innerValue.value = newValue;
				storageItem.setValue(newValue).then(() => {
					trigger();
					addWatcher();
				});
			},
		};
	});

	return { storageItem, ref: valueRef, innerValue };
}

export const useAppStore = defineStore("app", () => {
	const items = {
		injectedCSS: createItemBackedRef(storageItems.injectedCSS),
		selectedIndex: createItemBackedRef(storageItems.selectedIndex),
		entries: createItemBackedRef(storageItems.entries),
		logs: createItemBackedRef(storageItems.logs),
	} as const;

	const clearInjections = () => {
		while (items.injectedCSS.ref.value.length > 0) {
			items.injectedCSS.ref.value.pop();
		}
	};

	const loaded = computed(() => {
		return Object.values(items).every((s) => s.innerValue.loaded.value);
	});

	const selectedEntry = computed(
		() => items.entries.ref.value[items.selectedIndex.ref.value.value],
	);

	const save = async () => {
		// set the ref value to trigger save to storage :///
		items.entries.ref.value = [...items.entries.ref.value];
	};

	const addEntry = () => {
		const entry = createEntry();
		items.entries.ref.value = [...items.entries.ref.value, entry];
		selectEntry(items.entries.ref.value.length - 1);
	};

	const selectEntry = (index: number) => {
		const clampedIndex = clamp(index, 0, items.entries.ref.value.length - 1);
		items.selectedIndex.ref.value = { value: clampedIndex };
	};

	const removeEntry = (index: number) => {
		items.entries.ref.value = items.entries.ref.value.filter(
			(e) => e !== items.entries.ref.value[index],
		);
		const clamped = clamp(index, 0, items.entries.ref.value.length - 1);
		if (clamped !== index) {
			selectEntry(clamped);
		}
		console.log(
			`Removed entry, number of entries: ${items.entries.ref.value.length}`,
		);
	};

	const removeSelectedEntry = () => {
		removeEntry(items.selectedIndex.ref.value.value);
	};

	const setCSSInjections = (injections: CSSInjection[]) => {
		items.injectedCSS.ref.value = injections;
	};

	const clearLogs = () => {
		items.logs.ref.value = [];
	};

	const log = (l: LogEntry) => {
		items.logs.ref.value = [...items.logs.ref.value, l];
		while (items.logs.ref.value.length > 100) {
			items.logs.ref.value = items.logs.ref.value.slice(1);
		}
		if (l.severity === "error") {
			console.error(l.message, l.data);
		} else {
			console.log(l.message, l.data);
		}
	};

	return {
		loaded,
		...items,
		save,
		clearInjections,
		removeEntry,
		selectEntry,
		removeSelectedEntry,
		addEntry,
		setCSSInjections,
		log,
		clearLogs,
		selectedEntry,
	} as const;
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot));
}
