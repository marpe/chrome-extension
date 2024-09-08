import { onMessage, sendMessage } from "webext-bridge/background";

export default defineBackground({
	type: "module",
	main: () => {
		console.log(`Hello from ${browser.runtime.id}!`);

		const openPopup = () => {
			browser.windows.create({
				url: "popup.html",
				type: "popup",
				width: 1024,
				height: 768,
			});
		};

		browser.commands.onCommand.addListener((command, tab) => {
			console.log("Command:", { command, tab });

			if (command === "popout") {
				openPopup();
			} else {
				console.log("Unknown command:", command);
			}
		});

		const onContextMenuClicked = (info: chrome.contextMenus.OnClickData) => {
			console.log("Context menu clicked:", info);
			openPopup();
		};

		chrome.contextMenus.onClicked.addListener(onContextMenuClicked);

		browser.runtime.onInstalled.addListener((details) => {
			if (details.reason === "update") {
				console.log("Updated from version", details.previousVersion);
			} else {
				console.log("Installed");
			}

			browser.runtime.openOptionsPage();

			browser.action.setBadgeText({
				text: "OFF",
			});

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
