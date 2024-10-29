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
	world: "USER_SCRIPT" | "MAIN";
	allFrames: boolean;
	enabled: boolean;
	created: number;
	modified: number;
	revision: number;
};

export type CustomEntryId = CustomEntry["id"];

export type CSSInjection = Scripting.CSSInjection;

export type LogEntry = {
	severity: "info" | "warn" | "error" | "debug";
	timestamp: number;
	message: string;
	/* biome-ignore lint/suspicious/noExplicitAny: any is used to store arbitrary data */
	data: any;
};

export enum StorageKey {
	entryIds = "sync:entryIds",
	logs = "local:logs",
}

const defaults: {
	injectedCSS: CSSInjection[];
	entryIds: CustomEntryId[];
	logs: LogEntry[];
} = {
	injectedCSS: [],
	entryIds: [],
	logs: [],
} as const;

export const storageItems = {
	entryIds: storage.defineItem<CustomEntryId[]>(StorageKey.entryIds, {
		fallback: defaults.entryIds,
		init: () => defaults.entryIds,
	}),
	logs: storage.defineItem<LogEntry[]>(StorageKey.logs, {
		fallback: defaults.logs,
		init: () => defaults.logs,
	}),
} as const;
