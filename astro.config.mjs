import {defineConfig} from 'astro/config';
import {crx} from "@crxjs/vite-plugin";
import manifest from './public/manifest.json' assert {type: 'json'}

// https://astro.build/config
export default defineConfig({
  build: {
    assets: 'app',
  },
  vite: {
    server: {
      hmr: {
        port: 5173,
      },
    },
    plugins: [
      crx({manifest}),
    ],
  },
});
