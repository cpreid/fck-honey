export type MatchCallback = (el: HTMLDivElement) => void;

export interface ObserverOptions {
  onMatch?: MatchCallback;
  uuidGate?: boolean;
  zNearMax?: number;
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

function parseZIndex(cs: CSSStyleDeclaration, el: HTMLElement): number | null {
  const computed = parseInt(cs.zIndex, 10);
  if (isFinite(computed)) return computed;

  const inline = parseInt(el.style.zIndex, 10);
  return isFinite(inline) ? inline : null;
}

function looksLikeTargetDiv(el: HTMLDivElement, zNearMax: number, uuidGate: boolean): boolean {
  if (!el.id) return false;
  if (uuidGate && !UUIDISH_RE.test(el.id)) return false;

  const cs = getComputedStyle(el);
  const z = parseZIndex(cs, el);
  if (z === null || z < zNearMax) return false;
  if (cs.display === "none") return false;
  if (el.shadowRoot) return false;

  return true;
}

function scanElement(
  el: Element,
  seen: HTMLDivElement[],
  zNearMax: number,
  uuidGate: boolean,
  onMatch: MatchCallback
): void {
  if (el instanceof HTMLDivElement && el.matches(TARGET_SELECTOR)) {
    if (seen.indexOf(el) === -1 && looksLikeTargetDiv(el, zNearMax, uuidGate)) {
      seen.push(el);
      onMatch(el);
    }
  }

  const divs = el.querySelectorAll?.(TARGET_SELECTOR);
  if (!divs) return;
  for (let i = 0; i < divs.length; i += 1) {
    const d = divs[i] as HTMLDivElement;
    if (seen.indexOf(d) === -1 && looksLikeTargetDiv(d, zNearMax, uuidGate)) {
      seen.push(d);
      onMatch(d);
    }
  }
}

export function startHoneyOverlayObserver(options: ObserverOptions = {}): ObserverHandle {
  const seen: HTMLDivElement[] = [];
  const zNearMax = options.zNearMax ?? DEFAULT_Z_NEAR_MAX;
  const uuidGate = options.uuidGate ?? true;
  const onMatch =
    options.onMatch ??
    (() => {});

  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.target === document.body || (m.target instanceof Node && document.body.contains(m.target))) {
        console.log("+++ body mutation", m.type, m.target);
      }
    }
    for (const m of mutations) {
      if (m.type === "childList") {
        if (m.addedNodes.length) {
          for (let i = 0; i < m.addedNodes.length; i += 1) {
            const node = m.addedNodes[i];
            if (node.nodeType === Node.ELEMENT_NODE) {
              scanElement(node as Element, seen, zNearMax, uuidGate, onMatch);
            }
          }
        } else if (m.target instanceof Element) {
          scanElement(m.target, seen, zNearMax, uuidGate, onMatch);
        }
      } else if (m.type === "attributes") {
        if (m.target instanceof Element) {
          scanElement(m.target, seen, zNearMax, uuidGate, onMatch);
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

  scanElement(document.documentElement, seen, zNearMax, uuidGate, onMatch);

  return {
    stop: () => mo.disconnect()
  };
}

export function listen(onMatch: MatchCallback, options: Omit<ObserverOptions, "onMatch"> = {}): ListenHandle {
  return startHoneyOverlayObserver({ ...options, onMatch });
}
