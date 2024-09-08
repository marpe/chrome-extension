import type { Scripting } from "wxt/browser";

export type Entry = {
	id: string;
	description: string;
	site: string;
	style: string;
	script: string;
	created: number;
	modified: number;
	revision: number;
};

export type CSSInjection = Scripting.CSSInjection;

export type LogEntry = {
	severity: "info" | "warn" | "error" | "debug";
	timestamp: number;
	message: string;
	/* biome-ignore lint/suspicious/noExplicitAny: any is used to store arbitrary data */
	data: any;
};
