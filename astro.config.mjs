import {defineConfig} from 'astro/config';
import {crx, defineManifest} from "@crxjs/vite-plugin";
import manifest from './manifest.json' assert {type: 'json'}
const dummyId = "\0dummy";

// https://astro.build/config
const definedManifest = defineManifest(async (env) => {
  const {name, ...rest} = manifest;
  return {
    name: env.mode === "development" ? `[DEV] ${name}` : name,
    ...rest,
  }
});

const crxjs = crx({
  manifest: definedManifest,
});

/** @type {import('vite').Plugin} */
const myExample = {
  name: 'my-example', // this name will show up in logs and errors
  enforce: "post",
  resolveId(source, importer, options) {
    if (source.endsWith(".html")) {
      return { id: dummyId };
    }
    return null;
  },
  load(id) {
    if (id === dummyId) {
      return '// This is a dummy';
    }
    return null;
  },
  generateBundle: {
    order: "post",
    handler: function (options, bundle) {
      for (const [key, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.facadeModuleId === dummyId) {
          delete bundle[key]
          break
        }
      }
    },
  },
};

export default defineConfig({
  integrations: [
    {
      name: "MarpeTestIntegration",
      hooks: {
        'astro:config:done': (options) => {
        },
      },
    },
  ],
  output: 'static',
  build: {
    assets: 'app',
  },
  devToolbar: {
    enabled: false,
  },
  vite: {
    server: {
      hmr: {
        port: 5173,
      },
    },
    plugins: [
      [
        ...crxjs,
        myExample,
      ],
      /*Inspect({
        build: true,
        outputDir: '.vite-inspect',
      }),*/
    ],
  },
});
