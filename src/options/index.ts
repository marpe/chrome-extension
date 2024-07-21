import { setupApp } from "@/lib/utils.ts";
import App from "@/components/App.vue";

(async () => {
  console.log('connecting to devtools');
  // await devtools.connect();
  console.log("creating app");
  setupApp(App, '/options');
})();
