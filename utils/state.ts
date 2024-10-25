import { createEntry } from "@/utils/createEntry";
import type { Scripting } from "wxt/browser";
import RunAt = chrome.userScripts.RunAt;
import { storage } from "wxt/storage";

export type CustomEntry = {
	id: string;
	description: string;
	site: string;
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
	entries = "sync:entries",
	logs = "local:logs",
}

const defaults: {
	injectedCSS: CSSInjection[];
	entries: CustomEntry[];
	logs: LogEntry[];
} = {
	injectedCSS: [],
	entries: [],
	logs: [],
} as const;

export const storageItems = {
	entries: storage.defineItem<CustomEntry[]>(`${StorageKey.entries}-si`, {
		fallback: defaults.entries,
		init: () => defaults.entries,
	}),
	logs: storage.defineItem<LogEntry[]>(`${StorageKey.logs}-si`, {
		fallback: defaults.logs,
		init: () => defaults.logs,
	}),
} as const;
