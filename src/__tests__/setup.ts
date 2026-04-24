import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { server } from "./mocks/server";

// ─── MSW lifecycle ────────────────────────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Suppress TanStack Query v5 console.error for expected error test cases ───
beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
afterEach(() => vi.restoreAllMocks());

// ─── IntersectionObserver mock (jsdom does not implement it) ──────────────────
type IOCallback = (entries: IntersectionObserverEntry[]) => void;

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin = "0px";
  readonly thresholds: ReadonlyArray<number> = [0];

  static instances: MockIntersectionObserver[] = [];

  private callback: IOCallback;
  private observed = new Set<Element>();

  constructor(cb: IOCallback, _opts?: IntersectionObserverInit) {
    this.callback = cb;
    MockIntersectionObserver.instances.push(this);
  }

  observe(el: Element) {
    this.observed.add(el);
  }

  unobserve(el: Element) {
    this.observed.delete(el);
  }

  disconnect() {
    this.observed.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  simulateIntersection(isIntersecting: boolean, target?: Element) {
    const targets = target ? [target] : Array.from(this.observed);
    this.callback(
      targets.map((el) => ({
        isIntersecting,
        target: el,
        boundingClientRect: el.getBoundingClientRect(),
        intersectionRatio: isIntersecting ? 1 : 0,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      }))
    );
  }
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

afterEach(() => {
  MockIntersectionObserver.instances = [];
});

export function getLastIntersectionObserver(): MockIntersectionObserver {
  const { instances } = MockIntersectionObserver;
  if (!instances.length) throw new Error("No IntersectionObserver was created");
  return instances[instances.length - 1];
}
