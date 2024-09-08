import { useAppStore } from "@/stores/app.store";
import type { LogEntry } from "@/utils/state";

export const useLogging = () => {
	const store = useAppStore();

	const logInfo = (message: string, data?: LogEntry["data"]) => {
		log("info", message, data);
	};
	const logError = (message: string, data?: LogEntry["data"]) => {
		log("error", message, data);
	};
	const logWarn = (message: string, data?: LogEntry["data"]) => {
		log("warn", message, data);
	};
	const logDebug = (message: string, data?: LogEntry["data"]) => {
		log("debug", message, data);
	};

	const clearLogs = () => {
		store.clearLogs();
	};

	const log = (
		severity: LogEntry["severity"],
		message: string,
		data?: LogEntry["data"],
	) => {
		store.log({ severity, message, data, timestamp: Date.now() });
	};

	return {
		logs: store.logs,
		logDebug,
		logError,
		logInfo,
		logWarn,
		clearLogs,
	};
};
