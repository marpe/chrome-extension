import { type UseAsyncStateOptions, useAsyncState } from "@vueuse/core";
import { type Ref, type WritableComputedRef, computed, ref } from "vue";
import { type StorageItemKey, storage } from "wxt/storage";

export type UseStoredValueReturn<T> = {
	state: WritableComputedRef<T>;
	isReady: Ref<boolean>;
	isLoading: Ref<boolean>;
	isInitialized: Ref<boolean>;
};

export function useStoredValue<T>(
	key: StorageItemKey,
	initialValue: T,
	opts?: UseAsyncStateOptions<true, T>,
): UseStoredValueReturn<T> {
	const {
		state,
		execute: _, // Don't include "execute" in returned object
		...asyncState
	} = useAsyncState(
		() =>
			storage.getItem<T>(key).then((v) => {
				if (v === null) {
					console.log(
						"value was null, writing initial value",
						key,
						initialValue,
					);
					return storage.setItem(key, initialValue).then(() => {
						return initialValue;
					});
				}
				return v;
			}),
		initialValue,
		opts,
	);

	const isInitialized = ref(false);

	asyncState.then((value) => {
		isInitialized.value = true;
		return value;
	});

	/*// Listen for changes
	let unwatch: (() => void) | undefined;
	onMounted(() => {
		unwatch = storage.watch<T>(key, async (newValue) => {
			state.value = newValue ?? initialValue;
		});
	});
	onUnmounted(() => {
		unwatch?.();
	});*/

	return {
		// Use a writable computed ref to write updates to storage
		state: computed({
			get() {
				return state.value;
			},
			set(newValue) {
				console.log("set", key, newValue);
				void storage.setItem(key, newValue);
				state.value = newValue;
			},
		}),
		isInitialized,
		isLoading: asyncState.isLoading,
		isReady: asyncState.isReady,
	};
}
