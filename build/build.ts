import {removeInlineScriptAndStyle} from "./utils/extract-inline.ts";
import {bundleBackgroundAndContentScripts} from "./utils/bundler.ts";
import {join} from "path";
import {getFilepaths} from "./utils/get-filepaths.ts";

const distFolder = process.argv[2] ?? "./dist";
const srcFolder = process.argv[3] ?? "./src";

console.log("Extracting inline script and styles");
console.time("extract-inlined");
await removeInlineScriptAndStyle(distFolder);
console.timeEnd("extract-inlined");


console.time("bundle");
const entrypoints = await getFilepaths({dir: join(srcFolder, "scripts")});
console.log("Entrypoints: ", entrypoints);

console.log("Bundling background service worker...");
await bundleBackgroundAndContentScripts({
  entrypoints,
  outdir: distFolder,
});
console.timeEnd("bundle");
console.log("Done!");

// TODO (marpe): update manifest.json version
