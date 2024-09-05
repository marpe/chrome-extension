<script lang="ts"
        setup
>
const helloResponse = ref('');
const sendHello = async () => {
  try {
    const response = await browser.runtime.sendMessage({
      type: "hello",
      name: "Aaron",
    });
    helloResponse.value = JSON.stringify(response);
  } catch (err: any) {
    helloResponse.value = `ERROR: ${  err.message}`;
  }
};

const helloUnknown = ref('');
const sendUnknown = async () => {
  try {
    const response = await browser.runtime.sendMessage({ type: "unknown" });
    console.log({ response });
    helloUnknown.value = JSON.stringify(response);
  } catch (err: any) {
    helloUnknown.value = `ERROR: ${  err.message}`;
  }
};

const longLivedMessageList = ref<HTMLUListElement>();
const port = browser.runtime.connect();
port.onMessage.addListener((message) => {
  console.log({ message });
  const li = document.createElement("li");
  li.textContent = JSON.stringify(message);
  longLivedMessageList.value?.append(li);
});
port.postMessage('Hello from the popup!');
</script>

<template>
  <div>
    <ul />
    <h1>Messaging Example</h1>
    <div>
      <h2>One-time Message</h2>
      <button
        id="sendHelloMessageBtn"
        @click="sendHello"
      >
        Send "Hello" Message
      </button>
      <pre id="helloResponsePre">{{ helloResponse }}</pre>
      <button
        id="sendUnknownMessageBtn"
        @click="sendUnknown"
      >
        Send Unknown Message
      </button>
      <pre id="unknownResponsePre">{{ helloUnknown }}</pre>
    </div>
    <div>
      <h2>Long-lived Messages</h2>
      <ul ref="longLivedMessageList" />
    </div>
  </div>
</template>
