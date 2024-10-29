import type { CustomEntry } from "@/utils/state";
import { nanoid } from "nanoid";

export const createEntry = (
	description: string,
	id = `script-${nanoid()}`,
): CustomEntry => ({
	id,
	description: description,
	site: "*://*/*",
	runAt: "document_end",
	script: 'console.log("Hello World")',
	created: Date.now(),
	modified: Date.now(),
	world: "MAIN",
	revision: 1,
	enabled: true,
});
