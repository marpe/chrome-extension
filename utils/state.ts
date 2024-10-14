import { createEntry } from "@/utils/createEntry";
import type { Scripting } from "wxt/browser";
import RunAt = chrome.userScripts.RunAt;

export type CustomEntry = {
	id: string;
	description: string;
	site: string;
	style: string;
	script: string;
	runAt: RunAt;
	enabled: boolean;
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

export enum StorageKey {
	selectedIndex = "local:selectedIndex",
	entries = "sync:entries",
	injectedCSS = "local:cssInjections",
	logs = "local:logs",
}

const defaults: {
	injectedCSS: CSSInjection[];
	selectedIndex: { value: number };
	entries: CustomEntry[];
	logs: LogEntry[];
} = {
	injectedCSS: [],
	selectedIndex: { value: 0 },
	entries: [createEntry(`Default Entry`)],
	logs: [],
} as const;

export const storageItems = {
	injectedCSS: storage.defineItem<CSSInjection[]>(
		`${StorageKey.injectedCSS}-si`,
		{
			fallback: defaults.injectedCSS,
			init: () => defaults.injectedCSS,
		},
	),
	selectedIndex: storage.defineItem<{ value: number }>(
		`${StorageKey.selectedIndex}-si`,
		{
			fallback: defaults.selectedIndex,
			init: () => defaults.selectedIndex,
		},
	),
	entries: storage.defineItem<CustomEntry[]>(`${StorageKey.entries}-si`, {
		fallback: defaults.entries,
		init: () => defaults.entries,
	}),
	logs: storage.defineItem<LogEntry[]>(`${StorageKey.logs}-si`, {
		fallback: defaults.logs,
		init: () => defaults.logs,
	}),
} as const;
