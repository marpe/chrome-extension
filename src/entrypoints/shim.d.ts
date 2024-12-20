import type { ProtocolWithReturn } from "webext-bridge";
import type { Tabs } from "webextension-polyfill";

declare module "webext-bridge" {
	export interface ProtocolMap {
		ACTION: ProtocolWithReturn<
			{ message: string },
			{ message: string; tabs: Tabs.Tab[] }
		>;
		ACTIVATE_TAB: ProtocolWithReturn<
			{ tabId: number | undefined; windowId: number | undefined },
			{ result: boolean }
		>;
	}
}

export default {};
