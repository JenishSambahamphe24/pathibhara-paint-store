import { useEffect, useState } from "react";

// Movement before a mouse press counts as a drag rather than a click.
const DRAG_THRESHOLD_PX = 5;
// Written out in full: Tailwind only builds classes it finds as plain text.
const FADE_CLASSES = {
  both: "[mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]",
  start: "[mask-image:linear-gradient(to_right,transparent,black_24px)]",
  end: "[mask-image:linear-gradient(to_left,transparent,black_24px)]",
} as const;

interface IHorizontalScrollOptions {
  // An item matching this is scrolled into view whenever it changes, e.g.
  // the selected pill. Defaults to anything pressed.
  selectedSelector?: string;
}

// A sideways-scrolling row that also works with a mouse: the wheel scrolls it
// (handing back to the page at either end), dragging scrolls it, the
// scrollbar is hidden, the edges fade where more items are hidden, and the
// selected item stays in view.
// Touch and trackpad scrolling are left to the browser.
export function useHorizontalScroll<TElement extends HTMLElement>({
  selectedSelector = '[aria-pressed="true"]',
}: IHorizontalScrollOptions = {}) {
  // A callback ref, so a row that appears later (behind a condition) still
  // gets wired up.
  const [row, setRow] = useState<TElement | null>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  useEffect(() => {
    if (!row) return;

    function updateEdges() {
      if (!row) return;
      const maxScroll = row.scrollWidth - row.clientWidth;
      const start = row.scrollLeft > 1;
      const end = row.scrollLeft < maxScroll - 1;
      setEdges((current) =>
        current.start === start && current.end === end
          ? current
          : { start, end },
      );
    }

    function onWheel(event: WheelEvent) {
      if (!row || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const maxScroll = row.scrollWidth - row.clientWidth;
      const atEdge =
        (event.deltaY < 0 && row.scrollLeft <= 0) ||
        (event.deltaY > 0 && row.scrollLeft >= maxScroll - 1);
      if (maxScroll <= 0 || atEdge) return;
      event.preventDefault();
      row.scrollLeft += event.deltaY;
    }

    let drag: { x: number; scrollLeft: number; moved: boolean } | null = null;
    function onPointerDown(event: PointerEvent) {
      if (!row || event.pointerType !== "mouse" || event.button !== 0) return;
      drag = { x: event.clientX, scrollLeft: row.scrollLeft, moved: false };
    }
    function onPointerMove(event: PointerEvent) {
      if (!row || !drag) return;
      const distance = event.clientX - drag.x;
      if (!drag.moved && Math.abs(distance) < DRAG_THRESHOLD_PX) return;
      drag.moved = true;
      row.scrollLeft = drag.scrollLeft - distance;
    }
    function onPointerUp() {
      if (!drag?.moved) {
        drag = null;
        return;
      }
      drag = null;
      // The release after a drag would otherwise click the pill under it.
      row?.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopPropagation();
        },
        { capture: true, once: true },
      );
    }

    function revealSelected() {
      row
        ?.querySelector(selectedSelector)
        ?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }

    updateEdges();
    row.addEventListener("scroll", updateEdges, { passive: true });
    // Not passive: it has to stop the page scrolling while the row scrolls.
    row.addEventListener("wheel", onWheel, { passive: false });
    row.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    const resizes = new ResizeObserver(updateEdges);
    resizes.observe(row);
    const selection = new MutationObserver(revealSelected);
    selection.observe(row, {
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-pressed", "aria-selected", "aria-current"],
    });

    return () => {
      row.removeEventListener("scroll", updateEdges);
      row.removeEventListener("wheel", onWheel);
      row.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      resizes.disconnect();
      selection.disconnect();
    };
  }, [row, selectedSelector]);

  const fade =
    edges.start && edges.end
      ? FADE_CLASSES.both
      : edges.start
        ? FADE_CLASSES.start
        : edges.end
          ? FADE_CLASSES.end
          : "";

  return {
    ref: setRow,
    canScrollStart: edges.start,
    canScrollEnd: edges.end,
    // Hides the scrollbar and fades the edge(s) with more items behind them.
    className: `scrollbar-width-none ${fade}`.trim(),
  };
}
