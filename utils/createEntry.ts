import type { Entry } from "@/utils/state";
import { nanoid } from "nanoid";

export const createEntry = (): Entry => ({
	id: `script-${nanoid()}`,
	description: "Hello World",
	site: "*",
	style: "body {}",
	script: 'console.log("Hello World")',
	created: Date.now(),
	modified: Date.now(),
	revision: 1,
});
