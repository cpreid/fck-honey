import { listen, version } from "./core";

function buildAutoModalHtml(vendor: string): string {
  const query = encodeURIComponent(
    "Why is the " + vendor + " browser extension shady, and how can i uninstall it?"
  );
  const helpUrl = "http://chatgpt.com/?q=" + query;
  return (
    '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="honey-modal-title">' +
    '<h2 id="honey-modal-title">This site can’t proceed with ' +
    vendor +
    " enabled</h2>" +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px 0;">' +
    '<a href="' +
    helpUrl +
    '" target="_blank" rel="noopener noreferrer" style="display:block;padding:10px 12px;background:#e6eef7;color:#0b1b2b;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px;border-radius:6px;flex:1 1 220px;">Please disable it to continue your checkout.</a>' +
    '<a href="https://www.youtube.com/watch?v=wwB3FmbcC88" target="_blank" rel="noopener noreferrer" style="display:block;padding:10px 12px;background:#e6eef7;color:#0b1b2b;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px;border-radius:6px;flex:1 1 220px;">Here is why 🎥</a>' +
    "</div></div>"
  );
}

if (typeof window !== "undefined") {
  window.fckHoney = window.fckHoney || {};
  window.fckHoney.listen = listen;
  window.fckHoney.version = version;

  window.fckHoneyHandle = window.fckHoney.listen((warn, _el, vendor) => {
    const vendorLabel = vendor || "honey";
    warn(buildAutoModalHtml(vendorLabel));
  });
}

declare global {
  interface Window {
    fckHoney?: {
      listen?: typeof listen;
      version?: string;
    };
    fckHoneyHandle?: ReturnType<typeof listen>;
  }
}
