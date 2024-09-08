<script lang="ts"
        setup>
import Options from "@/entrypoints/options/pages/options.vue";
/*import { onMessage, sendMessage } from "webext-bridge/popup";

const send = async () => {
	const response = await sendMessage(
		"ACTION",
		{ message: "Hello from Popup" },
		"background",
	);

	console.log(response);
};*/
</script>

<template>
<!--  <div>
    <button class="btn-primary" @click="send">
      Send Message
    </button>
  </div>-->
  <Options />
</template>

<style>
body {
  min-width: 800px;
  height: 600px;
}

main {
  flex: 1 1 0;
}
</style>
