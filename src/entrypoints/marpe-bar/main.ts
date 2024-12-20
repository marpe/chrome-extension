import { createApp } from "vue";
import "@/assets/style.css";
import App from "./App.vue";

console.log("hello from marpe-bar\\main.ts");

const app = createApp(App);
app.mount(document.getElementById("app")!);
