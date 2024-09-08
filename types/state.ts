import { Entry } from "@/types/entry";
import type { Scripting } from "wxt/browser";

type CSSInjection = Scripting.CSSInjection;

export type State = {
  theme: string;
  installed: number;
  selectedIndex: number;
  saved: number | null;
  entries: Entry[];
  injectedCSS: CSSInjection[],
}