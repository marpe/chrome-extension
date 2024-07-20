/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />

// Put your variables here:

declare const __VERSION__: string
declare const __NAME__: string
declare const __DISPLAY_NAME__: string
declare const __CHANGELOG__: string
declare const __GIT_COMMIT__: string
declare const __GITHUB_URL__: string
declare const __BUILD_TIME__: string

interface ColorSelectionOptions {
  signal?: AbortSignal
}

interface ColorSelectionResult {
  sRGBHex: string
}

interface EyeDropper {
  open: (options?: ColorSelectionOptions) => Promise<ColorSelectionResult>
}

interface EyeDropperConstructor {
  new (): EyeDropper
}

interface Window {
  EyeDropper: EyeDropperConstructor
}

declare global {
  var EyeDropper: EyeDropperConstructor
}
