import { useAppStore } from "@/stores/app.store";
import { pinia } from "@/stores/pinia-instance";
import { updateUserScripts } from "@/utils/userScript";
import { until } from "@vueuse/core";
import { onMessage } from "webext-bridge/background";
import { browser } from "wxt/browser";
import { defineBackground } from "wxt/sandbox";

export default defineBackground({
	type: "module",
	main: () => {
		const openPopup = () => {
			browser.windows.create({
				url: "popup.html",
				type: "popup",
				width: 1024,
				height: 768,
			});
		};

		const store = useAppStore(pinia);
		void store.loadData();

		browser.commands.onCommand.addListener((command, tab) => {
			store?.logInfo("Command:", { command, tab });

			if (command === "popout") {
				openPopup();
			} else {
				store?.logError("Unknown command:", command);
			}
		});

		const onContextMenuClicked = (info: chrome.contextMenus.OnClickData) => {
			openPopup();
		};

		chrome.contextMenus.onClicked.addListener(onContextMenuClicked);

		chrome.webNavigation.onCommitted.addListener(async (details) => {});

		/*const updateCSS = async () => {
			await until(() => store.loaded).toBe(true);

			const cssInjections = [...store.injectedCSS.innerValue.value];

			await removeInjectedCSS(cssInjections);

			const entries = [...store.entries.innerValue.value];

			// biome-ignore format: keep on 1 line
			const { successfulInjections, failedInjections } = await injectCSS(entries, [details.tabId]);
		}*/

		chrome.webNavigation.onCompleted.addListener(async (details) => {});

		async function reregisterUserScripts() {
			await store.loadData();

			const entryIds = await chrome.storage.sync.get("entryIds");

			console.log("entryIds in sync storage", entryIds);

			console.log("store entries", store.entryIds.ref);

			const entriesFromStorage = await chrome.storage.sync.get(
				store.entryIds.ref,
			);

			console.log("Entries from storage", entriesFromStorage);

			const loadedEntries = Object.values(entriesFromStorage);

			const changes = await updateUserScripts(loadedEntries);
			store!.logInfo("Reregistered scripts", changes);
		}

		browser.runtime.onInstalled.addListener(async (details) => {
			const optionsUrl = browser.runtime.getURL("/options.html");
			if (details.reason === "update") {
				store?.logInfo("Extension updated", details);
				await reregisterUserScripts();
				browser.tabs.create({ url: `${optionsUrl}?updated` });
			} else {
				store?.logInfo("Extension installed", details);
				browser.tabs.create({ url: `${optionsUrl}?installed` });
			}

			/*browser.action.setBadgeText({
				text: "OFF",
			});*/

			browser.contextMenus.create({
				id: "menu",
				title: "marpe menu",
				contexts: ["all"],
			});
		});

		onMessage("ACTION", async ({ data }) => {
			console.log("Received message:", data);
			return { message: "hello!" };
		});
	},
});

/*

// Setup listener for one-time messages
browser.runtime.onMessage.addListener((message) => {
	// Only respond to hello messages
	if (message.type === "hello")
			// Returning a promise will send a response back to the sender
		return Promise.resolve(
				`Hello ${message.name}, this is the background!`,
		);

	throw new Error("Unknown message");
});

// Setup broadcast channel to send messages to all connected ports
const ports: Port[] = [];
setInterval(() => {
	const message = { date: Date.now(), value: Math.random() };
	ports.forEach((port) => port.postMessage(message));
}, 3000);

browser.runtime.onConnect.addListener((port) => {
	console.log("Connected", port);
	ports.push(port);
	port.onDisconnect.addListener(() => {
		console.log("Disconnected", port);
		ports.splice(ports.indexOf(port), 1);
	});
});*/
