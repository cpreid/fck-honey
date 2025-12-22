type MatchCallback = (el: HTMLDivElement) => void;

interface ObserverOptions {
  onMatch?: MatchCallback;
  uuidGate?: boolean;
  zNearMax?: number;
}

interface ObserverHandle {
  stop: () => void;
}

interface ListenHandle {
  stop: () => void;
}

const DEFAULT_Z_NEAR_MAX = 2147480000;
const UUIDISH_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseZIndex(cs: CSSStyleDeclaration): number | null {
  const z = parseInt(cs.zIndex, 10);
  return isFinite(z) ? z : null;
}

function looksLikeTargetDiv(el: HTMLDivElement, zNearMax: number, uuidGate: boolean): boolean {
  if (!el.id) return false;
  if (uuidGate && !UUIDISH_RE.test(el.id)) return false;

  const cs = getComputedStyle(el);
  const z = parseZIndex(cs);
  if (z === null || z < zNearMax) return false;
  if (cs.display === "none") return false;
  if (el.shadowRoot) return false;

  return true;
}

function checkNode(
  node: Node,
  seen: HTMLDivElement[],
  zNearMax: number,
  uuidGate: boolean,
  onMatch: MatchCallback
): void {
  if (!(node instanceof Element)) return;

  if (
    node instanceof HTMLDivElement &&
    seen.indexOf(node) === -1 &&
    looksLikeTargetDiv(node, zNearMax, uuidGate)
  ) {
    seen.push(node);
    onMatch(node);
  }

  const divs = node.querySelectorAll?.("div[id]");
  if (!divs) return;
  for (let i = 0; i < divs.length; i += 1) {
    const d = divs[i] as HTMLDivElement;
    if (seen.indexOf(d) === -1 && looksLikeTargetDiv(d, zNearMax, uuidGate)) {
      seen.push(d);
      onMatch(d);
    }
  }
}

function startHoneyOverlayObserver(options: ObserverOptions = {}): ObserverHandle {
  const seen: HTMLDivElement[] = [];
  const zNearMax = options.zNearMax ?? DEFAULT_Z_NEAR_MAX;
  const uuidGate = options.uuidGate ?? true;
  const onMatch =
    options.onMatch ??
    ((el) => {
      // Default: warn only, leaving response up to caller.
      console.warn("[honey-detect] matched near-max z-index div:", el);
    });

  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "childList") {
        for (let i = 0; i < m.addedNodes.length; i += 1) {
          checkNode(m.addedNodes[i], seen, zNearMax, uuidGate, onMatch);
        }
      } else if (m.type === "attributes") {
        const el = m.target;
        if (
          el instanceof HTMLDivElement &&
          el.id &&
          seen.indexOf(el) === -1 &&
          looksLikeTargetDiv(el, zNearMax, uuidGate)
        ) {
          seen.push(el);
          onMatch(el);
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

  checkNode(document.documentElement, seen, zNearMax, uuidGate, onMatch);

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
