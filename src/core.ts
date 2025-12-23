import { VERSION } from "./version";

export const version = VERSION;
export type WarnCallback = (message: string) => () => void;
export type MatchCallback = (warn: WarnCallback, el?: HTMLDivElement) => void;

export interface ObserverOptions {
  onMatch?: MatchCallback;
  uuidGate?: boolean;
  zNearMax?: number;
  debug?: boolean;
  removeHoney?: boolean;
  unbindAfterSeconds?: number;
}

export interface ObserverHandle {
  stop: () => void;
}

export interface ListenHandle {
  stop: () => void;
}

const DEFAULT_Z_NEAR_MAX = 2147480000;
const UUIDISH_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TARGET_SELECTOR = "div[id]";
const OVERLAY_STYLE_ID = "simple-overlay-styles";

function showOverlay(message: string): () => void {
  if (typeof document === "undefined") return () => {};

  if (!document.getElementById(OVERLAY_STYLE_ID)) {
    const style = document.createElement("style");
    style.id = OVERLAY_STYLE_ID;
    style.textContent =
      ".simple-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:999999;display:flex;align-items:center;justify-content:center;pointer-events:all;}" +
      ".simple-overlay-message{background:#ffffff;padding:16px 20px;border-radius:8px;font-size:14px;max-width:80%;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.3);}";
    document.head.appendChild(style);
  }

  const overlay = document.createElement("div");
  overlay.className = "simple-overlay";
  const messageEl = document.createElement("div");
  messageEl.className = "simple-overlay-message";
  messageEl.innerHTML = message;
  overlay.appendChild(messageEl);

  if (document.body) {
    document.body.appendChild(overlay);
  }

  const prevOverflow = document.body ? document.body.style.overflow : "";
  if (document.body) document.body.style.overflow = "hidden";

  return function hideOverlay() {
    overlay.remove();
    if (document.body) document.body.style.overflow = prevOverflow;
  };
}

function parseZIndex(cs: CSSStyleDeclaration, el: HTMLElement): number | null {
  const computed = parseInt(cs.zIndex, 10);
  if (isFinite(computed)) return computed;

  const inline = parseInt(el.style.zIndex, 10);
  return isFinite(inline) ? inline : null;
}

function looksLikeTargetDiv(
  el: HTMLDivElement,
  zNearMax: number,
  uuidGate: boolean,
  debug: boolean
): boolean {
  if (!el.id) {
    if (debug) console.log("+++ reject: no id", el);
    return false;
  }
  if (uuidGate && !UUIDISH_RE.test(el.id)) {
    if (debug) console.log("+++ reject: uuid", el.id);
    return false;
  }

  const cs = getComputedStyle(el);
  const z = parseZIndex(cs, el);
  if (z === null || z < zNearMax) {
    if (debug) console.log("+++ reject: z-index", z, cs.zIndex, el.style.zIndex, el);
    return false;
  }
  if (cs.display === "none") {
    if (debug) console.log("+++ reject: display none", el);
    return false;
  }
  if (el.shadowRoot) {
    if (debug) console.log("+++ reject: shadowRoot", el);
    return false;
  }

  if (debug) console.log("+++ match", el);
  return true;
}

function scanElement(
  el: Element,
  seen: HTMLDivElement[],
  zNearMax: number,
  uuidGate: boolean,
  debug: boolean,
  handleMatch: (match: HTMLDivElement) => void
): void {
  if (el instanceof HTMLDivElement && el.matches(TARGET_SELECTOR)) {
    if (seen.indexOf(el) === -1 && looksLikeTargetDiv(el, zNearMax, uuidGate, debug)) {
      seen.push(el);
      handleMatch(el);
    }
  }

  const divs = el.querySelectorAll?.(TARGET_SELECTOR);
  if (!divs) return;
  for (let i = 0; i < divs.length; i += 1) {
    const d = divs[i] as HTMLDivElement;
    if (seen.indexOf(d) === -1 && looksLikeTargetDiv(d, zNearMax, uuidGate, debug)) {
      seen.push(d);
      handleMatch(d);
    }
  }
}

export function startHoneyOverlayObserver(options: ObserverOptions = {}): ObserverHandle {
  const seen: HTMLDivElement[] = [];
  const zNearMax = options.zNearMax ?? DEFAULT_Z_NEAR_MAX;
  const uuidGate = options.uuidGate ?? true;
  const debug = options.debug ?? false;
  const removeHoney = options.removeHoney ?? true;
  const unbindAfterSeconds = options.unbindAfterSeconds;
  const warn: WarnCallback = (message) => showOverlay(message);
  const onMatch =
    options.onMatch ??
    (() => {});
  let matched = false;
  let unbindTimer: number | undefined;

  const handleMatch = (el: HTMLDivElement): void => {
    matched = true;
    if (typeof unbindTimer === "number") {
      clearTimeout(unbindTimer);
      unbindTimer = undefined;
    }
    if (removeHoney && el.parentNode) el.parentNode.removeChild(el);
    if (removeHoney) {
      onMatch(warn);
    } else {
      onMatch(warn, el);
    }
  };

  // Greedy, page-wide observer: Honey overlays can be inserted late, moved,
  // or have z-index applied after insertion. We watch all DOM changes so we
  // can catch the element no matter when it appears or how it's styled.
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (
        debug &&
        document.body &&
        (m.target === document.body || (m.target instanceof Node && document.body.contains(m.target)))
      ) {
        console.log("+++ body mutation", m.type, m.target);
      }
    }
    for (const m of mutations) {
      if (m.type === "childList") {
        if (m.addedNodes.length) {
          for (let i = 0; i < m.addedNodes.length; i += 1) {
            const node = m.addedNodes[i];
            if (node.nodeType === Node.ELEMENT_NODE) {
              scanElement(node as Element, seen, zNearMax, uuidGate, debug, handleMatch);
            }
          }
        }
        if (m.target instanceof Element) {
          scanElement(m.target, seen, zNearMax, uuidGate, debug, handleMatch);
        }
      } else if (m.type === "attributes") {
        if (m.target instanceof Element) {
          scanElement(m.target, seen, zNearMax, uuidGate, debug, handleMatch);
        }
      }
    }
  });

  mo.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["style", "class", "id"]
  });

  scanElement(document.documentElement, seen, zNearMax, uuidGate, debug, handleMatch);

  if (typeof unbindAfterSeconds === "number" && unbindAfterSeconds > 0) {
    unbindTimer = window.setTimeout(() => {
      if (!matched) {
        mo.disconnect();
      }
    }, unbindAfterSeconds * 1000);
  }

  return {
    stop: () => {
      mo.disconnect();
      if (typeof unbindTimer === "number") {
        clearTimeout(unbindTimer);
      }
    }
  };
}

export function listen(onMatch: MatchCallback, options: Omit<ObserverOptions, "onMatch"> = {}): ListenHandle {
  return startHoneyOverlayObserver({ ...options, onMatch });
}
