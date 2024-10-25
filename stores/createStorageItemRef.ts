import { type Ref, customRef, ref } from "vue";
import type { Unwatch, WxtStorageItem } from "wxt/storage";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function createStorageItemRef<T, M extends Record<string, unknown> = {}>(
	storageItem: WxtStorageItem<T, M>,
	debug?: string,
) {
	const innerValue: {
		value: T;
		loaded: Ref<boolean>;
		watcher: Unwatch | null;
		debug?: string;
	} = {
		value: storageItem.fallback,
		loaded: ref(false),
		watcher: null,
		debug,
	};

	const valueRef = customRef((track, trigger) => {
		const addWatcher = () => {
			// console.log(`[${debug}] adding watcher`);
			innerValue.watcher = storageItem.watch((v) => {
				/*console.log(`[${debug}] stored item was updated`, {
					storageItem: storageItem,
					old: innerValue.value,
					new: v,
				});*/
				innerValue.value = v;
				trigger();
			});
		};

		const removeWatcher = () => {
			// console.log(`[${debug}] removing watcher`);
			innerValue.watcher?.();
			innerValue.watcher = null;
		};

		storageItem
			.getValue()
			.then(async (v) => {
				// await sleep(1000);
				return v;
			})
			.then((v) => {
				// console.log(`[${debug}] loaded initial value`, v);
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
				// console.log(`[${debug}] setting`, newValue);
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
