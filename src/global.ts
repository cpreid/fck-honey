import { listen, version } from "./core";

if (typeof window !== "undefined") {
  window.fckHoney = window.fckHoney || {};
  window.fckHoney.listen = listen;
  window.fckHoney.version = version;
}

declare global {
  interface Window {
    fckHoney?: {
      listen?: typeof listen;
      version?: string;
    };
  }
}
