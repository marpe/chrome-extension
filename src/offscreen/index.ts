import { MESSAGE_TARGET, MESSAGE_TYPE } from "@/lib/consts";

const sendLog = async (...data: any[]) => {
  return chrome.runtime.sendMessage({
    target: MESSAGE_TARGET.BACKGROUND,
    type: MESSAGE_TYPE.CONSOLE_LOG,
    data,
  });
}

const consoleFunctions = [
  console.log,
  console.info,
  console.warn,
  console.error,
];

consoleFunctions.forEach((func) => {
    const oldFunc = func;
    // @ts-expect-error - we are overriding the default console functions
    console[func.name] = (...data: any[]) => {
      void sendLog(...data);
      oldFunc(...data);
    }
});

const orgOnError = window.onerror;
window.onerror = (...data) => {
  void sendLog(...data);
  orgOnError?.(...data);
}

window.addEventListener('unhandledrejection', (event) => {
  void sendLog(event.reason);
});

console.log('hello world from offscreen');
