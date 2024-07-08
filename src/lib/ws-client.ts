const TEN_SECONDS_MS = 10 * 1000;

let buildServerSocket: WebSocket | null = null;

console.log("registering background script");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('message', message);
  if (message.type === "get-is-connected") {
    sendResponse(buildServerSocket !== null);
  }
});

const sendIsConnectedMessage = async (isConnected: boolean) => {
  try {
    await chrome.runtime.sendMessage({"set-is-connected": isConnected});
  } catch (error) {
    console.error('error sending message', error);
  }
}

export const connectToBuildServer = () => {
  if (buildServerSocket) {
    buildServerSocket.close();
    return;
  }

  const destination = "ws://localhost:8080";

  const onclose = () => {
    buildServerSocket = null;
    void sendIsConnectedMessage(false);
  }
  const onopen = () => {
    console.log('websocket connected');
    void sendIsConnectedMessage(true);
  }

  const onmessage = (event: MessageEvent) => {
    if (event.data === "reload") {
      console.log('websocket received reload message');
      chrome.runtime.reload();
    } else {
      console.log(`websocket received message: ${event.data}`);
    }
  }

  buildServerSocket = connect(destination, {onmessage, onclose, onopen});
};

function keepAlive(webSocket: WebSocket) {
  console.log("starting keepalive");
  const sendKeepAlive = () => {
    try {
      if (webSocket.readyState === WebSocket.CLOSED ||
          webSocket.readyState === WebSocket.CLOSING) {
        console.log('stopping keepalive');
        clearInterval(t);
        return;
      }
      webSocket.send('keepalive');
    } catch (error) {
      console.log('stopping keepalive');
      clearInterval(t);
    }
  }

  // It's important to pick an interval that's shorter than 30s, to
  // avoid that the service worker becomes inactive.
  const t = setInterval(sendKeepAlive, TEN_SECONDS_MS);
}

function tryConnect(destination: string): WebSocket | null {
  try {
    return new WebSocket(destination);
  } catch (error) {
    console.log('websocket error', error);
    return null;
  }
}

function connect(destination: string, callbacks: {
  onopen?: () => void,
  onmessage?: (event: MessageEvent) => void
  onclose?: () => void,
}) {
  const webSocket = tryConnect(destination);
  if (webSocket) {
    webSocket.onmessage = callbacks.onmessage;
    webSocket.onclose = callbacks.onclose;
    webSocket.onopen = callbacks.onopen;
    keepAlive(webSocket);
  }
  return webSocket;
}
