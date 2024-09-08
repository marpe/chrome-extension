import type { ProtocolWithReturn } from "webext-bridge";

declare module "webext-bridge" {
	export interface ProtocolMap {
		ACTION: ProtocolWithReturn<{ message: string }, { message: string }>;
	}
}

export default {};
