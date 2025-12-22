type MatchCallback = (el: HTMLDivElement) => void;

interface ObserverOptions {
  onMatch?: MatchCallback;
  uuidGate?: boolean;
  zNearMax?: number;
  debug?: boolean;
}

interface ObserverHandle {
  stop: () => void;
}

interface ListenHandle {
  stop: () => void;
}

const DEFAULT_Z_NEAR_MAX = 2147480000;
const UUIDISH_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TARGET_SELECTOR = "div[id]";

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
  onMatch: MatchCallback
): void {
  if (el instanceof HTMLDivElement && el.matches(TARGET_SELECTOR)) {
    if (seen.indexOf(el) === -1 && looksLikeTargetDiv(el, zNearMax, uuidGate, debug)) {
      seen.push(el);
      onMatch(el);
    }
  }

  const divs = el.querySelectorAll?.(TARGET_SELECTOR);
  if (!divs) return;
  for (let i = 0; i < divs.length; i += 1) {
    const d = divs[i] as HTMLDivElement;
    if (seen.indexOf(d) === -1 && looksLikeTargetDiv(d, zNearMax, uuidGate, debug)) {
      seen.push(d);
      onMatch(d);
    }
  }
}

function startHoneyOverlayObserver(options: ObserverOptions = {}): ObserverHandle {
  const seen: HTMLDivElement[] = [];
  const zNearMax = options.zNearMax ?? DEFAULT_Z_NEAR_MAX;
  const uuidGate = options.uuidGate ?? true;
  const debug = options.debug ?? false;
  const onMatch =
    options.onMatch ??
    (() => {});

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
              scanElement(node as Element, seen, zNearMax, uuidGate, debug, onMatch);
            }
          }
        }
        if (m.target instanceof Element) {
          scanElement(m.target, seen, zNearMax, uuidGate, debug, onMatch);
        }
      } else if (m.type === "attributes") {
        if (m.target instanceof Element) {
          scanElement(m.target, seen, zNearMax, uuidGate, debug, onMatch);
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

  scanElement(document.documentElement, seen, zNearMax, uuidGate, debug, onMatch);

  return {
    stop: () => mo.disconnect()
  };
}

function listen(onMatch: MatchCallback, options: Omit<ObserverOptions, "onMatch"> = {}): ListenHandle {
  return startHoneyOverlayObserver({ ...options, onMatch });
}

if (typeof window !== "undefined") {
  window.fckHoney = window.fckHoney || {};
  window.fckHoney.startHoneyOverlayObserver = startHoneyOverlayObserver;
  window.fckHoney.listen = listen;
}

interface Window {
  fckHoney?: {
    startHoneyOverlayObserver?: typeof startHoneyOverlayObserver;
    listen?: typeof listen;
  };
}
