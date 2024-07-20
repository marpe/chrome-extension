export const MESSAGE_TARGET = {
  BACKGROUND: 'BACKGROUND',
  OFFSCREEN: 'OFFSCREEN',
  POPUP: 'POPUP',
  SIDE_PANEL: 'SIDE_PANEL',
  CONTENT_SCRIPT: 'CONTENT_SCRIPT',
} as const;

export const MESSAGE_TYPE = {
  CONSOLE_LOG: 'CONSOLE_LOG',
  EYEDROPPER: 'EYEDROPPER',
} as const;

export const COMMANDS = {
  eyedropper: 'eyedropper',
  reload: 'reload',
} as const;

export interface Message<T = any> {
  target: keyof typeof MESSAGE_TARGET,
  type: keyof typeof MESSAGE_TYPE,
  data: T
}
