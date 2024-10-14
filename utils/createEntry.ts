import type { CustomEntry } from "@/utils/state";
import { nanoid } from "nanoid";

export const createEntry = (description: string): CustomEntry => ({
	id: `script-${nanoid()}`,
	description: description,
	site: "*",
	runAt: "document_end",
	style: "body {}",
	script: 'console.log("Hello World")',
	created: Date.now(),
	modified: Date.now(),
	revision: 1,
	enabled: true,
});
