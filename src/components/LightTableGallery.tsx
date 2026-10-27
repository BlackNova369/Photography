import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from 'react';
import { Minus, Plus, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_FRAMES, GalleryFrame } from '../data/gallery';
import { sound } from '../utils/audio';

// ── Types & constants ───────────────────────────────────────────────────────

type EntrancePhase = 'stacked' | 'settled';
type Point = { x: number; y: number };
type Viewport = { w: number; h: number };

interface DragState {
  startX: number;
  startY: number;
  panX: number;
  panY: number;
  lastX: number;
  lastY: number;
  lastT: number;
  moved: boolean;
}

const CANVAS_W = 2800;
const CANVAS_H = 1800;
const PHOTO_APPROX_W = 228;
const PHOTO_APPROX_H = 160;

// Reference layout: staggered rows that start to the right of the text column,
// so the header sits on clean background. Set to false to use x/y/rotation
// from GALLERY_FRAMES instead.
const USE_GENERATED_LAYOUT = true;
const LAYOUT = {
  cols: 8,
  pitchX: 228,
  pitchY: 290,
  startXDesktop: 770, // leaves the left ~40% free for the header
  startXCompact: 120,
  startY: 70,
  jitterX: 22,
  jitterY: 30,
  maxRotation: 3.2,
};

// Vertical scrolling stops at the last row of prints (plus this much room for
// the bottom fade/nav) instead of the edge of the 1800px canvas.
const PRINT_MAX_H = 192; // tallest print incl. border and rotation
const SCROLL_END_PADDING = 120;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.8;
const ZOOM_STEP = 0.15;

const DRAG_THRESHOLD_PX = 5;
const INERTIA_FRICTION = 0.92;
const INERTIA_MIN_VELOCITY = 0.1;
const VELOCITY_STALE_MS = 80;

const STACK_HOLD_MS = 400;
const SPREAD_STAGGER_MS = 22;
const SPREAD_DURATION_MS = 850;

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80';

// ── Pure helpers ────────────────────────────────────────────────────────────

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const getInitialZoom = (vw: number) => {
  if (vw < 640) return 0.7; // mobile
  if (vw < 1024) return 0.85; // tablet
  return 1; // desktop
};

const getPanBounds = (vw: number, vh: number, zoom: number, contentBottom: number = CANVAS_H) => {
  const halfW = CANVAS_W / 2;
  const halfH = CANVAS_H / 2;

  let minX: number, maxX: number, minY: number, maxY: number;

  if (CANVAS_W * zoom >= vw) {
    maxX = halfW * (zoom - 1);
    minX = vw - halfW * (1 + zoom);
  } else {
    minX = maxX = vw / 2 - halfW;
  }

  // Top: canvas top at screen top. Bottom: the last print's bottom edge (plus
  // padding) can reach the bottom of the screen, and no further.
  maxY = halfH * (zoom - 1);
  minY = vh - halfH - (contentBottom - halfH) * zoom;
  if (minY > maxY) minY = maxY; // content shorter than the screen: nothing to scroll

  return { minX, maxX, minY, maxY };
};

const clampPan = (
  p: Point,
  zoom: number,
  vw: number,
  vh: number,
  contentBottom: number = CANVAS_H
): Point => {
  const { minX, maxX, minY, maxY } = getPanBounds(vw, vh, zoom, contentBottom);
  return { x: clamp(p.x, minX, maxX), y: clamp(p.y, minY, maxY) };
};

const getInitialPan = (vw: number, vh: number, zoom: number): Point => {
  const raw =
    vw >= 1024
      ? { x: -100, y: -80 }
      : { x: vw / 2 - CANVAS_W / 2, y: vh / 2 - CANVAS_H / 2 };
  return clampPan(raw, zoom, vw, vh);
};

/**
 * Returns the pan that keeps the canvas point currently under (px, py)
 * fixed on screen when the zoom changes from `from` to `to`.
 * Canvas transform: translate(pan) scale(zoom) with origin at canvas center.
 */
const zoomAroundPoint = (pan: Point, from: number, to: number, px: number, py: number): Point => {
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const localX = (px - pan.x - cx) / from; // offset from canvas center, unscaled
  const localY = (py - pan.y - cy) / from;
  return { x: px - cx - localX * to, y: py - cy - localY * to };
};

type Slot = { x: number; y: number; rotation: number };

/** Deterministic pseudo-random in [0, 1) so the layout is stable between renders. */
const seeded = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

const buildLayout = (frames: GalleryFrame[], isDesktop: boolean): Slot[] =>
  frames.map((frame, i) => {
    if (!USE_GENERATED_LAYOUT) return { x: frame.x, y: frame.y, rotation: frame.rotation };

    const col = i % LAYOUT.cols;
    const row = Math.floor(i / LAYOUT.cols);
    const startX = isDesktop ? LAYOUT.startXDesktop : LAYOUT.startXCompact;
    const rowShift = row % 2 === 1 ? LAYOUT.pitchX * 0.18 : 0;
    const jitter = (k: number, amount: number) => (seeded(i * 3 + k) - 0.5) * 2 * amount;

    return {
      x: startX + col * LAYOUT.pitchX + rowShift + jitter(1, LAYOUT.jitterX),
      y: LAYOUT.startY + row * LAYOUT.pitchY + jitter(2, LAYOUT.jitterY),
      rotation: jitter(3, LAYOUT.maxRotation),
    };
  });

const getStackedTransform = (slot: Slot, index: number, stackCenter: Point) => {
  const seed = index * 137.508;
  const jitterX = Math.sin(seed) * 26;
  const jitterY = Math.cos(seed * 1.31) * 26;
  const jitterRot = Math.sin(seed * 0.83) * 14;

  const tx = stackCenter.x - PHOTO_APPROX_W / 2 + jitterX;
  const ty = stackCenter.y - PHOTO_APPROX_H / 2 + jitterY;
  const rot = slot.rotation + jitterRot;

  return `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg) scale(0.82)`;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Single print (memoized so pan/zoom never re-renders the cards) ──────────

interface PrintCardProps {
  frame: GalleryFrame;
  index: number;
  slot: Slot;
  isStacked: boolean;
  stackCenter: Point;
  onOpen: (frame: GalleryFrame) => void;
}

const PrintCard = React.memo(function PrintCard({
  frame,
  index,
  slot,
  isStacked,
  stackCenter,
  onOpen,
}: PrintCardProps) {
  return (
    <div
      className="absolute left-0 top-0 hover:z-30 focus-within:z-30"
      style={{
        transform: isStacked
          ? getStackedTransform(slot, index, stackCenter)
          : `translate3d(${slot.x}px, ${slot.y}px, 0) rotate(${slot.rotation}deg) scale(1)`,
        transitionProperty: 'transform',
        transitionDuration: isStacked ? '0ms' : `${SPREAD_DURATION_MS}ms`,
        transitionDelay: isStacked ? '0ms' : `${index * SPREAD_STAGGER_MS}ms`,
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`Open ${frame.title || 'Memory frame'}, ${frame.year}`}
        className="group cursor-pointer transition-transform duration-300 ease-out hover:scale-[1.08] focus-visible:scale-[1.08] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900"
        onClick={() => onOpen(frame)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen(frame);
          }
        }}
      >
        <div className="bg-white p-1.5 sm:p-2 rounded-xs shadow-print group-hover:shadow-print-hover transition-shadow duration-300">
          <div className="overflow-hidden bg-neutral-200 rounded-2xs">
            <img
              src={frame.image}
              alt={frame.title || 'Memory frame'}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="block w-auto h-auto min-w-24 min-h-20 max-w-[11rem] sm:max-w-[14rem] max-h-32 sm:max-h-40 object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.dataset.fallback) return; // avoid an infinite error loop
                img.dataset.fallback = '1';
                img.src = FALLBACK_IMAGE;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

// ── Gallery ─────────────────────────────────────────────────────────────────

export const LightTableGallery: React.FC = () => {
  const [initialView] = useState(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const zoom = getInitialZoom(vw);
    const pan = getInitialPan(vw, vh, zoom);
    return { zoom, pan, vw, vh };
  });

  // Where the prints pile up before spreading out (canvas coordinates).
  const [stackCenter] = useState<Point>(() => {
    const { pan, zoom, vw, vh } = initialView;
    return {
      x: CANVAS_W / 2 + (vw / 2 - CANVAS_W / 2 - pan.x) / zoom,
      y: CANVAS_H / 2 + (vh / 2 - CANVAS_H / 2 - pan.y) / zoom,
    };
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [entrancePhase, setEntrancePhase] = useState<EntrancePhase>(() =>
    prefersReducedMotion() ? 'settled' : 'stacked'
  );
  // React state is only for what the UI displays; pan lives in a ref and is
  // written straight to the DOM so dragging never triggers a re-render.
  const [zoom, setZoom] = useState(initialView.zoom);
  const [isDragging, setIsDragging] = useState(false);

  const panRef = useRef<Point>(initialView.pan);
  const contentBottomRef = useRef(CANVAS_H);
  const zoomRef = useRef(initialView.zoom);
  const viewportRef = useRef<Viewport>({ w: initialView.vw, h: initialView.vh });

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const pointers = useRef(new Map<number, Point>());
  const dragRef = useRef<DragState | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const velocity = useRef<Point>({ x: 0, y: 0 });
  const inertiaRaf = useRef<number | null>(null);
  const suppressClick = useRef(false);

  const filteredFrames = GALLERY_FRAMES;

  const slots = useMemo(
    () => buildLayout(filteredFrames, initialView.vw >= 1024),
    [filteredFrames, initialView.vw]
  );

  const activeFrame = useMemo(
    () => (activeId ? GALLERY_FRAMES.find((f) => f.id === activeId) ?? null : null),
    [activeId]
  );
  const isLightboxOpen = activeFrame !== null;

  // ── Canvas transform (direct DOM write) ───────────────────────────────────

  const applyTransform = useCallback((animate = false) => {
    const el = canvasRef.current;
    if (!el) return;
    const { x, y } = panRef.current;
    el.style.transition = animate ? 'transform 200ms ease-out' : 'none';
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${zoomRef.current})`;
  }, []);

  useLayoutEffect(() => {
    applyTransform();
  }, [applyTransform]);

  // Scroll limit follows the prints currently shown (also after changing filter).
  useLayoutEffect(() => {
    const lastRowY = slots.reduce((max, slot) => Math.max(max, slot.y), 0);
    contentBottomRef.current = Math.min(CANVAS_H, lastRowY + PRINT_MAX_H + SCROLL_END_PADDING);
    const { w, h } = viewportRef.current;
    panRef.current = clampPan(panRef.current, zoomRef.current, w, h, contentBottomRef.current);
    applyTransform(true);
  }, [slots, applyTransform]);

  const stopInertia = useCallback(() => {
    if (inertiaRaf.current !== null) {
      cancelAnimationFrame(inertiaRaf.current);
      inertiaRaf.current = null;
    }
    velocity.current = { x: 0, y: 0 };
  }, []);

  useEffect(() => stopInertia, [stopInertia]);

  const setZoomLevel = useCallback(
    (nextZoom: number, anchor?: Point, animate = false) => {
      const { w, h } = viewportRef.current;
      const z = Math.round(clamp(nextZoom, MIN_ZOOM, MAX_ZOOM) * 100) / 100;
      const a = anchor ?? { x: w / 2, y: h / 2 };
      const nextPan = zoomAroundPoint(panRef.current, zoomRef.current, z, a.x, a.y);
      zoomRef.current = z;
      panRef.current = clampPan(nextPan, z, w, h, contentBottomRef.current);
      setZoom(z);
      applyTransform(animate);
    },
    [applyTransform]
  );

  // ── Inertia (runs only while there is momentum left) ──────────────────────

  const startInertia = useCallback(() => {
    if (inertiaRaf.current !== null) cancelAnimationFrame(inertiaRaf.current);

    const step = () => {
      const v = velocity.current;
      if (Math.abs(v.x) < INERTIA_MIN_VELOCITY && Math.abs(v.y) < INERTIA_MIN_VELOCITY) {
        inertiaRaf.current = null;
        return;
      }
      const { w, h } = viewportRef.current;
      const next = { x: panRef.current.x + v.x, y: panRef.current.y + v.y };
      const clamped = clampPan(next, zoomRef.current, w, h, contentBottomRef.current);
      if (clamped.x !== next.x) v.x = 0; // hit an edge
      if (clamped.y !== next.y) v.y = 0;
      panRef.current = clamped;
      applyTransform();
      v.x *= INERTIA_FRICTION;
      v.y *= INERTIA_FRICTION;
      inertiaRaf.current = requestAnimationFrame(step);
    };
    inertiaRaf.current = requestAnimationFrame(step);
  }, [applyTransform]);

  // ── Entrance animation ────────────────────────────────────────────────────

  useEffect(() => {
    if (prefersReducedMotion()) {
      setEntrancePhase('settled');
      return;
    }
    setEntrancePhase('stacked');
    let timer: number | undefined;
    const rafId = requestAnimationFrame(() => {
      timer = window.setTimeout(() => setEntrancePhase('settled'), STACK_HOLD_MS);
    });
    return () => {
      cancelAnimationFrame(rafId);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  // ── Resize: keep the canvas inside the viewport ───────────────────────────

  useEffect(() => {
    const onResize = () => {
      viewportRef.current = { w: window.innerWidth, h: window.innerHeight };
      panRef.current = clampPan(
        panRef.current,
        zoomRef.current,
        viewportRef.current.w,
        viewportRef.current.h,
        contentBottomRef.current
      );
      applyTransform();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [applyTransform]);

  // ── Wheel / trackpad: scroll pans, Ctrl/Cmd + wheel (or pinch) zooms ──────
  // Registered manually because React's onWheel is passive and cannot preventDefault.

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stopInertia();
      if (e.ctrlKey || e.metaKey) {
        setZoomLevel(zoomRef.current * Math.exp(-e.deltaY * 0.01), { x: e.clientX, y: e.clientY });
      } else {
        const { w, h } = viewportRef.current;
        panRef.current = clampPan(
          { x: panRef.current.x - e.deltaX, y: panRef.current.y - e.deltaY },
          zoomRef.current,
          w,
          h,
          contentBottomRef.current
        );
        applyTransform();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [applyTransform, setZoomLevel, stopInertia]);

  // ── Pointer handling (mouse, touch, pen; two-finger pinch) ────────────────

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;

    stopInertia();
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 1) {
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
        lastX: e.clientX,
        lastY: e.clientY,
        lastT: performance.now(),
        moved: false,
      };
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchRef.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: zoomRef.current };
      if (dragRef.current) dragRef.current.moved = true; // a pinch is never a click
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Pinch zoom
    if (pointers.current.size === 2 && pinchRef.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      setZoomLevel(pinchRef.current.zoom * (dist / pinchRef.current.dist), {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
      });
      return;
    }

    const d = dragRef.current;
    if (!d) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    // Only treat it as a drag after a small threshold so plain clicks still work.
    if (!d.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      d.moved = true;
      setIsDragging(true);
      containerRef.current?.setPointerCapture(e.pointerId);
    }

    const { w, h } = viewportRef.current;
    const next = { x: d.panX + dx, y: d.panY + dy };
    const clamped = clampPan(next, zoomRef.current, w, h, contentBottomRef.current);
    panRef.current = clamped;
    applyTransform();

    // Velocity in px per ~frame (16ms), sampled at most every 10ms to reduce noise.
    const now = performance.now();
    const dt = now - d.lastT;
    if (dt >= 10) {
      velocity.current = {
        x: clamped.x === next.x ? ((e.clientX - d.lastX) / dt) * 16 : 0,
        y: clamped.y === next.y ? ((e.clientY - d.lastY) / dt) * 16 : 0,
      };
      d.lastX = e.clientX;
      d.lastY = e.clientY;
      d.lastT = now;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(e.pointerId)) return;

    // Pinch ended with one finger still down: continue as a drag from there.
    if (pointers.current.size === 1) {
      const [p] = [...pointers.current.values()];
      dragRef.current = {
        startX: p.x,
        startY: p.y,
        panX: panRef.current.x,
        panY: panRef.current.y,
        lastX: p.x,
        lastY: p.y,
        lastT: performance.now(),
        moved: true,
      };
      pinchRef.current = null;
      return;
    }

    if (pointers.current.size === 0) {
      const d = dragRef.current;
      if (d?.moved) {
        // The click event fires right after pointerup; swallow it so a drag never opens a print.
        suppressClick.current = true;
        window.setTimeout(() => {
          suppressClick.current = false;
        }, 0);

        if (performance.now() - d.lastT > VELOCITY_STALE_MS) {
          velocity.current = { x: 0, y: 0 }; // finger rested before release
        }
        startInertia();
      }
      dragRef.current = null;
      pinchRef.current = null;
      setIsDragging(false);
    }
  };

  // ── Controls ──────────────────────────────────────────────────────────────

  const handleReset = () => {
    const { w, h } = viewportRef.current;
    const z = getInitialZoom(w);
    stopInertia();
    zoomRef.current = z;
    panRef.current = getInitialPan(w, h, z);
    setZoom(z);
    applyTransform(true);
  };

  // ── Lightbox ──────────────────────────────────────────────────────────────

  const handleOpenFrame = useCallback((frame: GalleryFrame) => {
    if (suppressClick.current) return;
    sound.playPaperLift();
    setActiveId(frame.id);
  }, []);

  const closeLightbox = useCallback(() => setActiveId(null), []);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      const len = filteredFrames.length;
      if (len < 2) return;
      setActiveId((current) => {
        const i = filteredFrames.findIndex((f) => f.id === current);
        return filteredFrames[(i + dir + len) % len].id;
      });
      sound.playTick(dir === 1 ? 520 : 480);
    },
    [filteredFrames]
  );

  // Keyboard shortcuts, only while the lightbox is open.
  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') navigate(1);
      else if (e.key === 'ArrowLeft') navigate(-1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isLightboxOpen, navigate, closeLightbox]);

  // Move focus into the dialog on open, and give it back on close.
  useEffect(() => {
    if (!isLightboxOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    return () => previouslyFocused?.focus?.({ preventScroll: true });
  }, [isLightboxOpen]);

  // Preload neighbouring images so prev/next feels instant.
  useEffect(() => {
    if (!activeFrame) return;
    const len = filteredFrames.length;
    const i = filteredFrames.findIndex((f) => f.id === activeFrame.id);
    if (i < 0 || len < 2) return;
    [1, -1].forEach((d) => {
      new Image().src = filteredFrames[(i + d + len) % len].image;
    });
  }, [activeFrame, filteredFrames]);

  const isStacked = entrancePhase === 'stacked';

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full h-[100dvh] overflow-hidden select-none bg-[#F6F5F2] touch-none"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          overscrollBehavior: 'none',
          // `clip` forbids even programmatic/focus-driven scrolling; browsers that
          // don't support it fall back to the `overflow-hidden` class.
          overflow: 'clip',
        }}
        onScroll={(e) => {
          // Safety net: if anything still scrolls this container, snap it back.
          e.currentTarget.scrollTo(0, 0);
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="absolute top-20 sm:top-24 md:top-[20%] left-4 sm:left-6 md:left-12 lg:left-16 z-20 pointer-events-none max-w-xl">
          <h1 className="font-condensed text-6xl sm:text-7xl md:text-[110px] lg:text-[160px] leading-[0.84] text-ink-900 tracking-tight mb-4 sm:mb-5">
            GALLERY
          </h1>
          <div className="w-10 sm:w-12 h-[1px] bg-neutral-300 mb-4 sm:mb-5" />
          <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed mb-4 max-w-xs sm:max-w-sm">
            Setiap senyuman tulus, setiap tatapan tenang, dan bingkai-bingkai indah tanpa rekayasa di antaranya—tersebar seperti kenangan berharga tentang kita.
          </p>
          <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.16em] text-neutral-400 uppercase">
            — DRAG TO EXPLORE OUR MOMENTS
          </div>
        </div>

        {/* Canvas (transform is applied imperatively via canvasRef) */}
        <div
          ref={canvasRef}
          className="absolute left-0 top-0 will-change-transform"
          style={{
            width: `${CANVAS_W}px`,
            height: `${CANVAS_H}px`,
            transformOrigin: '50% 50%',
          }}
        >
          {filteredFrames.map((frame, index) => (
            <PrintCard
              key={frame.id}
              frame={frame}
              index={index}
              slot={slots[index]}
              isStacked={isStacked}
              stackCenter={stackCenter}
              onOpen={handleOpenFrame}
            />
          ))}
        </div>

        {/* Soft fade where the prints run under the bottom navigation */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-28 bg-gradient-to-t from-[#F6F5F2] via-[#F6F5F2]/70 to-transparent" />

        {/* Zoom controls.
            Mobile: floats above the bottom navbar (80px + safe area).
            Desktop: standard bottom-8. */}
        <div
          data-no-drag
          className="fixed right-4 sm:right-6 md:right-8 z-40 flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-white/80 border border-neutral-300/80 backdrop-blur-md shadow-sm bottom-[calc(80px+env(safe-area-inset-bottom,0px))] md:bottom-8"
        >
          <button
            type="button"
            onClick={() => setZoomLevel(zoomRef.current - ZOOM_STEP, undefined, true)}
            disabled={zoom <= MIN_ZOOM}
            className="w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-neutral-200/50 text-neutral-700 transition-colors disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-neutral-900"
            aria-label="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span
            className="font-mono text-[11px] sm:text-xs px-1 sm:px-2 text-neutral-700 min-w-[4ch] text-center select-none"
            aria-live="polite"
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel(zoomRef.current + ZOOM_STEP, undefined, true)}
            disabled={zoom >= MAX_ZOOM}
            className="w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-neutral-200/50 text-neutral-700 transition-colors disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-neutral-900"
            aria-label="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-neutral-200/50 text-neutral-700 transition-colors focus-visible:outline-2 focus-visible:outline-neutral-900"
            aria-label="Reset view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lightbox: rendered outside the pan container so its pointer events never start a drag */}
      {activeFrame && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label={activeFrame.title || 'Memory frame'}
        >
          <div
            className="absolute inset-0 bg-[#F6F5F2]/90 backdrop-blur-lg"
            onClick={closeLightbox}
          />
          <div className="relative max-w-5xl max-h-[85vh] flex flex-col items-center z-10 w-full">
            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeLightbox}
              className="absolute -top-10 sm:-top-12 right-0 p-2 rounded-full bg-white/80 border border-neutral-300 hover:bg-white text-neutral-700 transition-all shadow-sm"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {filteredFrames.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="absolute -left-3 sm:-left-14 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 border border-neutral-300 hover:bg-white text-neutral-700 transition-all shadow-sm flex items-center justify-center"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(1)}
                  className="absolute -right-3 sm:-right-14 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 border border-neutral-300 hover:bg-white text-neutral-700 transition-all shadow-sm flex items-center justify-center"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="bg-white p-2 sm:p-3 md:p-4 rounded-xs shadow-2xl overflow-hidden max-h-[75vh] mx-8 sm:mx-0">
              <img
                key={activeFrame.id}
                src={activeFrame.image}
                alt={activeFrame.title || 'Memory frame'}
                className="max-h-[60vh] sm:max-h-[65vh] w-auto object-contain rounded-2xs"
              />
            </div>
            <div className="mt-3 sm:mt-4 flex items-center justify-between w-full text-[10px] sm:text-xs font-mono tracking-wider text-neutral-700 px-2 gap-3">
              <span className="font-medium uppercase truncate">
                {activeFrame.title || 'GALLERY'}
              </span>
              <span className="text-neutral-500 uppercase whitespace-nowrap">
                {activeFrame.location ? `${activeFrame.location} · ` : ''}{activeFrame.year}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};