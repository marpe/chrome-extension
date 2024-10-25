<script lang="ts"
        setup>
import About from "@/entrypoints/options/pages/about.vue";
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

  <RouterView v-slot="{ Component }">
    <template v-if="Component">
      <Transition mode="out-in"
                  name="slide-up">
        <!--        <KeepAlive>-->
        <Suspense>
          <component :is="Component" />

          <template #fallback>
            <div class="flex flex-col items-center justify-center gap-4">
              <h2>Loading</h2>
              <i-lucide-loader-circle class="spin size-8" />
            </div>
          </template>
        </Suspense>
        <!--        </KeepAlive>-->
      </Transition>
    </template>
  </RouterView>

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
