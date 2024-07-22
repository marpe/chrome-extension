import type { Runtime } from "webextension-polyfill";

export default defineBackground({
  type: 'module',
  main: () => {
    console.log(`Hello from ${browser.runtime.id}!`);

    // Setup listener for one-time messages
    browser.runtime.onMessage.addListener((message) => {
      // Only respond to hello messages
      if (message.type === "hello")
          // Returning a promise will send a response back to the sender
        return Promise.resolve(`Hello ${message.name}, this is the background!`);

      throw new Error("Unknown message");
    });

    // Setup broadcast channel to send messages to all connected ports
    const ports: Runtime.Port[] = [];
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
    });
  },
});
