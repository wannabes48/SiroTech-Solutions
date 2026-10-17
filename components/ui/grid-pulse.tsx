"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type GridPulseProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> & {
  /** Cell size in px. The hairlines and the lit cells share it. */
  cell?: number;
  /** How far from the pointer a cell can still catch light, in cells. */
  reach?: number;
  /** How many cells light on their own each beat, so the grid is never dead. */
  ambient?: number;
  /** A lid, so a fast sweep cannot light the whole field at once. */
  maxLit?: number;
  /**
   * Elements whose lines of text the light holds back from, looked up
   * inside the grid's parent.
   */
  avoid?: string;
  /** Hue at the top of the field. Defaults to SiroTech Emerald (158). */
  hueTop?: number;
  /** Hue span across the grid. Defaults to -68 for emerald-to-sage transition. */
  hueSpan?: number;
  /** Saturation percentage for the theme palette. Defaults to 65%. */
  saturation?: number;
};

/**
 * SiroTech Theme Lightness Ladders:
 * Carefully tuned for high architectural clarity on light grounds (bg-surface / bg-bg)
 * and deep emerald/sage luminosity on dark grounds.
 */
const TINTS = [44, 52, 60, 68, 76];
const TINTS_DARK = [60, 68, 75, 82, 88];

/** How faint a cell goes right behind a line of text. */
const FAINT = 0.12;
/** How many cells it takes to come back up to full strength. */
const FADE = 2.4;
/** Clearing kept around each line of text, in px. */
const PAD = 6;
const FADE_IN = 160;
const FADE_OUT = 750;

type Cell = {
  col: number;
  row: number;
  colour: string;
  /** How much of its colour the cell is allowed, 0 to 1. */
  dim: number;
  born: number;
  /** When it starts to fade out. */
  until: number;
};

const easeOut = (t: number) => 1 - (1 - t) ** 2;
const easeIn = (t: number) => t * t;

/**
 * A fine grid that takes colour where the pointer passes and lets it go a
 * moment later, with a few cells lighting on their own. The spectrum runs
 * down the field using SiroTech Solutions brand theme colours: Emerald (#059669),
 * Deep Forest Green (#1B2E24), and Architectural Sage (#6F7F60).
 *
 * Place it inside a positioned container, under the content. It is
 * decoration only: hidden from assistive tech, transparent to the pointer,
 * drawn on one canvas that sleeps whenever nothing is lit, paused off screen,
 * and still for readers who ask for reduced motion.
 */
export function GridPulse({
  cell = 26,
  reach = 2.8,
  ambient = 3,
  maxLit = 180,
  avoid = "[data-grid-avoid]",
  hueTop = 158,
  hueSpan = -68,
  saturation = 65,
  className,
  style,
  ...props
}: GridPulseProps) {
  const box = React.useRef<HTMLDivElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const el = box.current;
    const paper = canvas.current;
    const ctx = paper?.getContext("2d");
    if (!el || !paper || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cols = 1;
    let rows = 1;
    let width = 0;
    let height = 0;
    let clear: DOMRect[] = [];
    let tints = TINTS;
    const cells = new Map<string, Cell>();

    // Light or dark ground, read from the text colour the grid inherits,
    // so it follows any theme switch: a class, an attribute or the system.
    const probe = document.createElement("canvas").getContext("2d", {
      willReadFrequently: true,
    });
    const readTheme = () => {
      if (!probe) return;
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle = getComputedStyle(el).color;
      probe.fillRect(0, 0, 1, 1);
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
      const light = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.5;
      tints = light ? TINTS_DARK : TINTS;
    };

    // Protect the lines of text, not the boxes that hold them: a paragraph
    // set to a measure keeps that width on its short last line too, and the
    // box would hold a band of cells dark where there is nothing to read.
    const measureText = () => {
      const bounds = el.getBoundingClientRect();
      const scope = el.parentElement ?? document;
      clear = [...scope.querySelectorAll(avoid)].flatMap((node) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        const lines = [...range.getClientRects()].filter(
          (r) => r.width > 0 && r.height > 0,
        );
        const boxes = lines.length > 0 ? lines : [node.getBoundingClientRect()];
        return boxes.map(
          (r) =>
            new DOMRect(
              r.left - bounds.left - PAD,
              r.top - bounds.top - PAD,
              r.width + PAD * 2,
              r.height + PAD * 2,
            ),
        );
      });
    };

    const measure = () => {
      width = el.clientWidth;
      height = el.clientHeight;
      cols = Math.max(1, Math.ceil(width / cell));
      rows = Math.max(1, Math.ceil(height / cell));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      paper.width = Math.round(width * dpr);
      paper.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readTheme();
      measureText();
      wake();
    };

    /**
     * How bright a cell may be, by its distance from the nearest line of
     * text. Cells behind the words go faint rather than dark: a hole cut in
     * the grid reads as a fault, a dip in brightness reads as depth.
     */
    const brightness = (col: number, row: number) => {
      const x = col * cell + cell / 2;
      const y = row * cell + cell / 2;
      let nearest = Number.POSITIVE_INFINITY;
      for (const r of clear) {
        const dx = Math.max(r.left - x, 0, x - r.right);
        const dy = Math.max(r.top - y, 0, y - r.bottom);
        nearest = Math.min(nearest, Math.hypot(dx, dy));
        if (nearest === 0) break;
      }
      if (nearest === Number.POSITIVE_INFINITY) return 1;
      return FAINT + (1 - FAINT) * Math.min(1, nearest / (FADE * cell));
    };

    /**
     * SiroTech Architectural Palette Generator:
     * Sweeps from Emerald (hue ~158°) into Forest & Sage (hue ~90°),
     * with an occasional (~8%) warm gold accent (hue 40°) matching brand highlights.
     */
    const ink = (row: number) => {
      // Occasional warm gold accent highlight
      if (Math.random() < 0.08) {
        return `hsl(40 88% ${tints[Math.floor(Math.random() * tints.length)]}%)`;
      }
      const t = rows > 1 ? Math.min(1, row / (rows - 1)) : 0;
      const hue = (((hueTop - t * hueSpan) % 360) + 360) % 360;
      const tint = tints[Math.floor(Math.random() * tints.length)];
      return `hsl(${Math.round(hue)} ${saturation}% ${tint}%)`;
    };

    // One loop draws every cell; it runs only while something is lit.
    let frame = 0;
    const draw = (now: number) => {
      frame = 0;
      ctx.clearRect(0, 0, width, height);
      for (const [key, c] of cells) {
        let alpha: number;
        if (now < c.until) {
          alpha = easeOut(Math.min(1, (now - c.born) / FADE_IN));
        } else {
          const t = (now - c.until) / FADE_OUT;
          if (t >= 1) {
            cells.delete(key);
            continue;
          }
          alpha = 1 - easeIn(t);
        }
        ctx.globalAlpha = alpha * c.dim;
        ctx.fillStyle = c.colour;
        // Inset by the hairline, so the grid still shows between lit cells.
        ctx.fillRect(c.col * cell + 1, c.row * cell + 1, cell - 1, cell - 1);
      }
      ctx.globalAlpha = 1;
      if (cells.size > 0) frame = requestAnimationFrame(draw);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    /** Lights one cell, unless it is off the grid or already lit. */
    const light = (col: number, row: number, hold: number) => {
      if (col < 0 || row < 0 || col >= cols || row >= rows) return;
      if (cells.size >= maxLit) return;
      const key = `${col},${row}`;
      const now = performance.now();
      const lit = cells.get(key);
      if (lit && now < lit.until) return;
      // A cell caught again while fading picks up from where it had got to,
      // instead of blinking out and back in.
      let born = now;
      if (lit) {
        const faded = 1 - easeIn(Math.min(1, (now - lit.until) / FADE_OUT));
        born = now - (1 - Math.sqrt(1 - faded)) * FADE_IN;
      }
      cells.set(key, {
        col,
        row,
        colour: lit?.colour ?? ink(row),
        dim: brightness(col, row),
        born,
        until: now + hold,
      });
      wake();
    };

    // The pointer paints. Cells further from it catch light less often, so
    // the edge of the trail breaks up instead of moving as a block.
    let pending = 0;
    let at: { x: number; y: number } | null = null;
    const paint = () => {
      pending = 0;
      if (!at) return;
      const cx = Math.floor(at.x / cell);
      const cy = Math.floor(at.y / cell);
      const span = Math.ceil(reach);
      for (let dy = -span; dy <= span; dy++) {
        for (let dx = -span; dx <= span; dx++) {
          const away = Math.hypot(dx, dy);
          if (away > reach) continue;
          if (Math.random() > 1 - away / (reach + 0.6)) continue;
          light(cx + dx, cy + dy, 260 + Math.random() * 900);
        }
      }
    };
    // Listened for on the window, because the grid sits under the content
    // and never receives the pointer itself.
    const onMove = (event: PointerEvent) => {
      const bounds = el.getBoundingClientRect();
      at = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      if (!pending) pending = requestAnimationFrame(paint);
    };

    // A few cells find their own way on, so the grid is alive on arrival and
    // on a screen with no pointer at all. Paused while out of sight.
    let visible = true;
    let beat = 0;
    const drift = () => {
      beat = window.setTimeout(drift, 1400 + Math.random() * 1800);
      if (!visible || document.hidden) return;
      for (let i = 0; i < ambient; i++) {
        light(
          Math.floor(Math.random() * cols),
          Math.floor(Math.random() * rows),
          900 + Math.random() * 1600,
        );
      }
    };
    beat = window.setTimeout(drift, 500);

    const sight = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    sight.observe(el);
    const resize = new ResizeObserver(measure);
    resize.observe(el);
    // Text added, removed or rewritten moves the lines to hold back from.
    let recheck = 0;
    const copy = new MutationObserver(() => {
      if (!recheck) {
        recheck = requestAnimationFrame(() => {
          recheck = 0;
          measureText();
        });
      }
    });
    copy.observe(el.parentElement ?? document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    const theme = new MutationObserver(readTheme);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", readTheme);
    measure();
    // Lines of text move once the web fonts arrive.
    document.fonts?.ready.then(measureText).catch(() => {});
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      sight.disconnect();
      resize.disconnect();
      copy.disconnect();
      cancelAnimationFrame(recheck);
      theme.disconnect();
      scheme.removeEventListener("change", readTheme);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(pending);
      clearTimeout(beat);
      window.removeEventListener("pointermove", onMove);
    };
  }, [cell, reach, ambient, maxLit, avoid, hueTop, hueSpan, saturation]);

  return (
    <div
      ref={box}
      aria-hidden
      data-slot="grid-pulse"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        // The hairlines in SiroTech sage/rule tone
        "[--grid-pulse-line:color-mix(in_srgb,var(--color-sage-700,#6f7f60)_12%,transparent)]",
        // Fades out at top and bottom so it integrates seamlessly with surrounding sections
        "[mask-image:linear-gradient(to_bottom,transparent_0%,#000_8%,#000_92%,transparent_100%)]",
        className,
      )}
      style={
        {
          "--grid-pulse-cell": `${cell}px`,
          backgroundImage:
            "linear-gradient(to right, var(--grid-pulse-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-pulse-line) 1px, transparent 1px)",
          backgroundSize: "var(--grid-pulse-cell) var(--grid-pulse-cell)",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <canvas ref={canvas} className="absolute inset-0 size-full" />
    </div>
  );
}

export default GridPulse;
