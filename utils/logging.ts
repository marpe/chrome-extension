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
		while (store.logs.ref.length > 0) {
			store.logs.ref.pop();
		}
	};
	const log = (
		severity: LogEntry["severity"],
		message: string,
		data?: LogEntry["data"],
	) => {
		if (store.logs.ref.push) {
			store.logs.ref.push({
				severity,
				timestamp: Date.now(),
				message,
				data,
			});
		}
		if (severity === "error") {
			console.error(message, data);
		} else {
			console.log(message, data);
		}
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
