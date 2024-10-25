import "@/assets/style.css";
import "~console";
import "~console/theme-detect";

import { setupApp } from "@/utils/utils";
import App from "./App.vue";
const app = setupApp(App).mount("#app");
