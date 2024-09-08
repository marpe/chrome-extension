import { createEntry } from "@/utils/createEntry";
import type { CSSInjection, Entry, LogEntry } from "@/utils/state";
import type { StorageLikeAsync } from "@vueuse/core";
import type { Unwatch } from "wxt/storage";

enum StorageKey {
	selectedIndex = "local:selectedIndex",
	entries = "sync:entries",
	injectedCSS = "local:cssInjections",
	logs = "local:logs",
}

export const useAppStore = defineStore("app", () => {
	const injectedCSSRef = useStorageAsync<CSSInjection[]>(
		StorageKey.injectedCSS,
		[],
		storage as StorageLikeAsync,
	);
	const selectedIndexRef = useStorageAsync<{ value: number }>(
		StorageKey.selectedIndex,
		{ value: 0 },
		storage as StorageLikeAsync,
	);
	const entriesRef = useStorageAsync<Entry[]>(
		StorageKey.entries,
		[createEntry()],
		storage as StorageLikeAsync,
	);
	const logsRef = useStorageAsync<LogEntry[]>(
		StorageKey.logs,
		[],
		storage as StorageLikeAsync,
	);
	const store = {
		loaded: ref(false),
		injectedCSS: {
			ref: injectedCSSRef, // ref<CSSInjection[]>([] as CSSInjection[])
			storageItem: storage.defineItem<CSSInjection[]>(
				`${StorageKey.injectedCSS}-si`,
				{
					init: () => [],
				},
			),
		},
		selectedIndex: {
			ref: selectedIndexRef, // ref(0),
			storageItem: storage.defineItem<{ value: number }>(
				`${StorageKey.selectedIndex}-si`,
				{
					init: () => ({ value: 0 }),
				},
			),
		},
		entries: {
			ref: entriesRef, // ref<Entry[]>([] as Entry[]),
			storageItem: storage.defineItem<Entry[]>(`${StorageKey.entries}-si`, {
				init: () => [createEntry()],
			}),
		},
		logs: {
			ref: logsRef, // ref<LogEntry[]>([] as LogEntry[]),
			storageItem: storage.defineItem<LogEntry[]>(`${StorageKey.logs}-si`, {
				init: () => [],
			}),
		},
	};

	const watchers: Record<StorageKey, Unwatch | null> = {
		[StorageKey.selectedIndex]: null,
		[StorageKey.entries]: null,
		[StorageKey.injectedCSS]: null,
		[StorageKey.logs]: null,
	};

	const load = async () => {
		console.log("Loading app store");

		await new Promise((resolve) => setTimeout(resolve, 1000));

		store.entries.ref.value = await store.entries.storageItem.getValue();
		store.injectedCSS.ref.value =
			await store.injectedCSS.storageItem.getValue();
		store.logs.ref.value = await store.logs.storageItem.getValue();
		store.selectedIndex.ref.value =
			await store.selectedIndex.storageItem.getValue();

		addWatchers();

		store.loaded.value = true;
	};

	const addWatchers = () => {
		watchers[StorageKey.selectedIndex] = store.selectedIndex.storageItem.watch(
			(value) => {
				store.selectedIndex.ref.value = value;
			},
		);

		watchers[StorageKey.entries] = store.entries.storageItem.watch((value) => {
			store.entries.ref.value = value;
		});

		watchers[StorageKey.injectedCSS] = store.injectedCSS.storageItem.watch(
			(value) => {
				store.injectedCSS.ref.value = value;
			},
		);

		watchers[StorageKey.logs] = store.logs.storageItem.watch((value) => {
			store.logs.ref.value = value;
		});
	};

	const removeWatchers = () => {
		watchers[StorageKey.selectedIndex]?.();
		watchers[StorageKey.entries]?.();
		watchers[StorageKey.injectedCSS]?.();
		watchers[StorageKey.logs]?.();
		watchers[StorageKey.selectedIndex] = null;
		watchers[StorageKey.entries] = null;
		watchers[StorageKey.injectedCSS] = null;
		watchers[StorageKey.logs] = null;
	};

	const save = async () => {
		removeWatchers();
		await store.entries.storageItem.setValue(toRaw(store.entries.ref.value));
		await store.injectedCSS.storageItem.setValue(
			toRaw(store.injectedCSS.ref.value),
		);
		await store.logs.storageItem.setValue(toRaw(store.logs.ref.value));
		await store.selectedIndex.storageItem.setValue(
			toRaw(store.selectedIndex.ref.value),
		);
		addWatchers();
	};

	void load();

	return {
		...store,
		load,
		save,
		async test() {
			await storage.setItem(StorageKey.selectedIndex, {
				value: Math.floor(Math.random() * 1000),
			});
		},
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot));
}
