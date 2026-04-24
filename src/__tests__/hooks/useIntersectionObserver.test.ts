import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRef } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { getLastIntersectionObserver } from "../setup";

// Helper: renders the hook with a real DOM element attached to the ref.
// jsdom provides the Element so observer.observe() receives a real target.
function renderWithElement(
  options?: Parameters<typeof useIntersectionObserver>[1]
) {
  const element = document.createElement("div");
  document.body.appendChild(element);

  const { result, unmount, rerender } = renderHook(() => {
    const ref = useRef<Element>(element);
    return useIntersectionObserver(ref, options);
  });

  return { result, unmount, rerender, element };
}

describe("useIntersectionObserver", () => {
  // ── initial state ────────────────────────────────────────────────────────────

  it("returns false before any intersection event", () => {
    const { result, unmount } = renderWithElement();
    expect(result.current).toBe(false);
    unmount();
  });

  // ── intersection triggers ────────────────────────────────────────────────────

  it("returns true when the observer fires with isIntersecting: true", () => {
    const { result, element, unmount } = renderWithElement();

    act(() => {
      getLastIntersectionObserver().simulateIntersection(true, element);
    });

    expect(result.current).toBe(true);
    unmount();
  });

  it("returns false again when element leaves the viewport", () => {
    const { result, element, unmount } = renderWithElement();

    act(() => {
      getLastIntersectionObserver().simulateIntersection(true, element);
    });
    expect(result.current).toBe(true);

    act(() => {
      getLastIntersectionObserver().simulateIntersection(false, element);
    });
    expect(result.current).toBe(false);
    unmount();
  });

  // ── cleanup ──────────────────────────────────────────────────────────────────

  it("calls disconnect on the observer when the component unmounts", () => {
    const { unmount } = renderWithElement();

    const observer = getLastIntersectionObserver();
    const disconnectSpy = vi.spyOn(observer, "disconnect");

    unmount();

    expect(disconnectSpy).toHaveBeenCalledOnce();
  });

  // ── null ref ─────────────────────────────────────────────────────────────────

  it("does not create an IntersectionObserver when the ref is null", () => {
    const MockIO = window.IntersectionObserver as unknown as {
      instances: unknown[];
    };
    const countBefore = MockIO.instances.length;

    const { unmount } = renderHook(() => {
      // Deliberately null ref — simulates a component that hasn't mounted yet
      const ref = useRef<Element | null>(null);
      return useIntersectionObserver(ref);
    });

    expect(MockIO.instances.length).toBe(countBefore);
    unmount();
  });

  // ── freezeOnceVisible ────────────────────────────────────────────────────────

  it("does not disconnect and recreate the observer when deps are stable and already intersecting with freezeOnceVisible", () => {
    const { result, element, unmount } = renderWithElement({
      freezeOnceVisible: true,
    });

    act(() => {
      getLastIntersectionObserver().simulateIntersection(true, element);
    });
    expect(result.current).toBe(true);

    // The effect deps (ref, threshold, root, rootMargin) haven't changed —
    // no new observer is created, the first one is still active.
    const observerCount = (
      window.IntersectionObserver as unknown as { instances: unknown[] }
    ).instances.length;
    expect(observerCount).toBe(1);
    unmount();
  });

  it("uses the provided rootMargin option", () => {
    const observeSpy = vi.fn();
    // Capture the options passed to the constructor
    let capturedOptions: IntersectionObserverInit | undefined;
    const OriginalMock = window.IntersectionObserver;
    const MockWithCapture = class extends (
      OriginalMock as unknown as new (
        cb: (entries: IntersectionObserverEntry[]) => void,
        opts?: IntersectionObserverInit
      ) => IntersectionObserver
    ) {
      constructor(
        cb: (entries: IntersectionObserverEntry[]) => void,
        opts?: IntersectionObserverInit
      ) {
        super(cb, opts);
        capturedOptions = opts;
      }
      observe(el: Element) {
        observeSpy(el);
        super.observe(el);
      }
    };
    Object.defineProperty(window, "IntersectionObserver", {
      value: MockWithCapture,
      configurable: true,
    });

    const { unmount } = renderWithElement({ rootMargin: "200px" });

    expect(capturedOptions?.rootMargin).toBe("200px");
    expect(observeSpy).toHaveBeenCalledOnce();

    // Restore original mock
    Object.defineProperty(window, "IntersectionObserver", {
      value: OriginalMock,
      configurable: true,
    });
    unmount();
  });
});
