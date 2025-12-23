import { listen, startHoneyOverlayObserver } from "./core";

if (typeof window !== "undefined") {
  window.fckHoney = window.fckHoney || {};
  window.fckHoney.startHoneyOverlayObserver = startHoneyOverlayObserver;
  window.fckHoney.listen = listen;
}

declare global {
  interface Window {
    fckHoney?: {
      startHoneyOverlayObserver?: typeof startHoneyOverlayObserver;
      listen?: typeof listen;
    };
  }
}
