import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { X, Shuffle, Eye, Trophy, ChevronDown, Sparkles } from 'lucide-react';
import { BABY_IMAGES } from '../data/artworks';
import reward1 from '../assets/baby/afaf3bdd-28c3-45fd-8b53-7d2c48957baa.jpeg';
import reward2 from '../assets/baby/9996128c-5b55-42cf-8990-feb4a388a7d0.jpeg';
import reward3 from '../assets/baby/d79c9bf9-e40b-40e0-8b95-b9a358cd6c07.jpeg';
import { JumpscareOverlay } from './JumpscareOverlay';

// ── Konfigurasi level ───────────────────────────────────────
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { size: number; label: string; hint: string }
> = {
  easy: { size: 2, label: 'Mudah', hint: '2×2 · 4 keping' },
  medium: { size: 3, label: 'Sedang', hint: '3×3 · 9 keping' },
  hard: { size: 4, label: 'Sulit', hint: '4×4 · 16 keping' },
  expert: { size: 5, label: 'Ahli', hint: '5×5 · 25 keping' },
};

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

const PHOTOS = [
  { src: reward1, label: 'Daeva 01' },
  { src: reward2, label: 'Daeva 02' },
  { src: reward3, label: 'Daeva 03' },
  { src: BABY_IMAGES[0], label: 'Daeva 04' },
];

// ── Ukuran papan ────────────────────────────────────────────
const TAB_RATIO = 0.3; // ruang untuk "tab" keping, relatif terhadap ukuran keping
const MAX_BOARD = 500;
const MIN_BOARD = 240; // hanya batas bawah untuk tinggi layar; lebar layar selalu diprioritaskan
const BOARD_HEIGHT_RESERVE = 320; // ruang untuk header, dropdown, dan tombol
const SNAP_UNITS = 0.4; // jarak snap, dalam satuan "1 keping"

// ── Tipe & helper ───────────────────────────────────────────
type EdgePattern = 'straight' | 'tab' | 'blank';

interface PieceEdges {
  top: EdgePattern;
  right: EdgePattern;
  bottom: EdgePattern;
  left: EdgePattern;
}

/**
 * Posisi x/y disimpan dalam satuan "keping" (bukan piksel), jadi saat papan
 * berubah ukuran keping tetap berada di tempat yang benar dan puzzle tidak
 * perlu diacak ulang. Posisi tujuan keping = (c, r).
 */
interface PieceState {
  id: number;
  r: number;
  c: number;
  x: number;
  y: number;
  locked: boolean;
}

function opposite(p: EdgePattern): EdgePattern {
  return p === 'tab' ? 'blank' : p === 'blank' ? 'tab' : 'straight';
}

function generatePiecesEdges(size: number): PieceEdges[][] {
  const result: PieceEdges[][] = [];
  for (let r = 0; r < size; r++) {
    result[r] = [];
    for (let c = 0; c < size; c++) {
      result[r][c] = {
        top: 'straight',
        right: 'straight',
        bottom: 'straight',
        left: 'straight',
      };
    }
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (c < size - 1) {
        result[r][c].right = Math.random() < 0.5 ? 'tab' : 'blank';
        result[r][c + 1].left = opposite(result[r][c].right);
      }
      if (r < size - 1) {
        result[r][c].bottom = Math.random() < 0.5 ? 'tab' : 'blank';
        result[r + 1][c].top = opposite(result[r][c].bottom);
      }
    }
  }
  return result;
}

function edgeTop(p: EdgePattern): string {
  if (p === 'straight') return 'L 100 0';
  const d = p === 'tab' ? -1 : 1;
  return `L 35 0 C 40 ${5 * d} 40 ${20 * d} 50 ${20 * d} C 60 ${20 * d} 60 ${5 * d} 65 0 L 100 0`;
}
function edgeRight(p: EdgePattern): string {
  if (p === 'straight') return 'L 100 100';
  const d = p === 'tab' ? 1 : -1;
  return `L 100 35 C ${100 + 5 * d} 40 ${100 + 20 * d} 40 ${100 + 20 * d} 50 C ${100 + 20 * d} 60 ${100 + 5 * d} 60 100 65 L 100 100`;
}
function edgeBottom(p: EdgePattern): string {
  if (p === 'straight') return 'L 0 100';
  const d = p === 'tab' ? 1 : -1;
  return `L 65 100 C 60 ${100 + 5 * d} 60 ${100 + 20 * d} 50 ${100 + 20 * d} C 40 ${100 + 20 * d} 40 ${100 + 5 * d} 35 100 L 0 100`;
}
function edgeLeft(p: EdgePattern): string {
  if (p === 'straight') return 'L 0 0';
  const d = p === 'tab' ? -1 : 1;
  return `L 0 65 C ${5 * d} 60 ${20 * d} 60 ${20 * d} 50 C ${20 * d} 40 ${5 * d} 40 0 35 L 0 0`;
}
function piecePath(e: PieceEdges): string {
  return `M 0 0 ${edgeTop(e.top)} ${edgeRight(e.right)} ${edgeBottom(e.bottom)} ${edgeLeft(e.left)} Z`;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// ── Komponen ────────────────────────────────────────────────
interface PuzzleGameModalProps {
  onClose: () => void;
}

export const PuzzleGameModal: React.FC<PuzzleGameModalProps> = ({ onClose }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [photoIdx, setPhotoIdx] = useState(0);
  const [edges, setEdges] = useState<PieceEdges[][]>([]);
  const [pieces, setPieces] = useState<PieceState[]>([]);

  // State Animasi & Menang
  const [isWon, setIsWon] = useState(false);
  const [isSuckingIn, setIsSuckingIn] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [moves, setMoves] = useState(0);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [jumpscare, setJumpscare] = useState(false);

  // Lebar area papan yang tersedia (diukur langsung, bukan ditebak dari window)
  const [areaW, setAreaW] = useState(0);
  const [viewportH, setViewportH] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const areaRef = useRef<HTMLDivElement>(null);

  const piecesRef = useRef<PieceState[]>([]);
  const winTimers = useRef<number[]>([]);
  const dragRef = useRef<{
    id: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const size = DIFFICULTY_CONFIG[difficulty].size;
  const total = size * size;

  // Papan + ruang tab di kiri/kanan HARUS muat di area yang tersedia.
  const boardSize = useMemo(() => {
    const byWidth = areaW > 0 ? areaW / (1 + (2 * TAB_RATIO) / size) : 280;
    const byHeight = Math.max(MIN_BOARD, viewportH - BOARD_HEIGHT_RESERVE);
    return Math.floor(Math.min(MAX_BOARD, byWidth, byHeight));
  }, [areaW, viewportH, size]);

  const pieceSize = boardSize / size;
  const svgSize = pieceSize * 1.6;
  const tabPadding = pieceSize * TAB_RATIO;

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    setAreaW(Math.floor(el.clientWidth));
    const ro = new ResizeObserver(([entry]) => {
      setAreaW(Math.floor(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const commitPieces = useCallback((next: PieceState[]) => {
    piecesRef.current = next;
    setPieces(next);
  }, []);

  const clearWinTimers = useCallback(() => {
    winTimers.current.forEach((t) => window.clearTimeout(t));
    winTimers.current = [];
  }, []);

  useEffect(() => clearWinTimers, [clearWinTimers]);

  // Acak ulang puzzle (dipakai saat awal, ganti level/foto, dan "Main Lagi")
  const shuffle = useCallback(() => {
    clearWinTimers();
    setEdges(generatePiecesEdges(size));
    commitPieces(
      Array.from({ length: total }, (_, i) => ({
        id: i,
        r: Math.floor(i / size),
        c: i % size,
        x: Math.random() * Math.max(0.01, size - 1),
        y: Math.random() * Math.max(0.01, size - 1),
        locked: false,
      }))
    );
    setMoves(0);
    setIsWon(false);
    setIsSuckingIn(false);
    setShowWinModal(false);
  }, [size, total, clearWinTimers, commitPieces]);

  useEffect(() => {
    shuffle();
  }, [shuffle, photoIdx]);

  const startWinSequence = () => {
    clearWinTimers();
    const later = (fn: () => void, ms: number) =>
      winTimers.current.push(window.setTimeout(fn, ms));
    later(() => setIsWon(true), 300); // 1. Overlay muncul, gambar terbang keluar
    later(() => setIsSuckingIn(true), 1800); // 2. Gambar tersedot & teks muncul
    later(() => setShowWinModal(true), 3200); // 3. Modal kemenangan masuk
  };

  const handlePointerDown = (e: React.PointerEvent, piece: PieceState) => {
    if (piece.locked || isWon) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      id: piece.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: piece.x,
      origY: piece.y,
    };
    setDraggingId(piece.id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = (e.clientX - drag.startX) / pieceSize;
    const dy = (e.clientY - drag.startY) / pieceSize;
    const min = -TAB_RATIO;
    const max = size - 1 + TAB_RATIO;
    commitPieces(
      piecesRef.current.map((p) =>
        p.id === drag.id
          ? { ...p, x: clamp(drag.origX + dx, min, max), y: clamp(drag.origY + dy, min, max) }
          : p
      )
    );
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setDraggingId(null);

    const piece = piecesRef.current.find((p) => p.id === drag.id);
    if (!piece) return;

    const moved = Math.abs(piece.x - drag.origX) > 0.01 || Math.abs(piece.y - drag.origY) > 0.01;
    if (!moved) return;
    setMoves((m) => m + 1);

    if (Math.hypot(piece.x - piece.c, piece.y - piece.r) >= SNAP_UNITS) return;

    const updated = piecesRef.current.map((p) =>
      p.id === piece.id ? { ...p, x: p.c, y: p.r, locked: true } : p
    );
    commitPieces(updated);
    if (updated.every((p) => p.locked)) startWinSequence();
  };

  const handleDifficultyChange = (d: Difficulty) => {
    if (d === difficulty) return;
    clearWinTimers();
    commitPieces([]);
    setEdges([]);
    setMoves(0);
    setIsWon(false);
    setIsSuckingIn(false);
    setShowWinModal(false);
    setDifficulty(d);
  };

  const triggerJumpscare = () => {
    if (jumpscare) return;
    setJumpscare(true);
  };

  const currentPhoto = PHOTOS[photoIdx];
  const allPaths = edges.map((row) => row.map((e) => piecePath(e)));
  const lockedCount = pieces.filter((p) => p.locked).length;

  return (
    <>
      {/* ── CSS Keyframes ── */}
      <style>{`
        /* 1. Gambar terbang keluar dari kotak */
        @keyframes solved-fly-out {
          0% {
            transform: perspective(1200px) scale(0.2) rotateY(-90deg) rotateX(20deg) translateY(20px);
            opacity: 0;
            filter: brightness(3) blur(12px);
          }
          30% {
            transform: perspective(1200px) scale(0.7) rotateY(-20deg) rotateX(5deg) translateY(-20px);
            opacity: 1;
            filter: brightness(1.8) blur(3px);
          }
          70% {
            transform: perspective(1200px) scale(1.15) rotateY(5deg) rotateX(-5deg) translateY(-40px);
            opacity: 1;
            filter: brightness(1.2) blur(0);
          }
          100% {
            transform: perspective(1200px) scale(1) rotateY(0deg) rotateX(0deg) translateY(-30px);
            opacity: 1;
            filter: brightness(1);
          }
        }

        /* 2. Gambar berputar, mengecil, tersedot */
        @keyframes solved-suck-in {
          0% {
            transform: scale(1) rotate(0deg) translateY(-30px);
            opacity: 1;
            filter: brightness(1);
          }
          30% {
            transform: scale(1.15) rotate(45deg) translateY(-40px);
            opacity: 1;
            filter: brightness(2) drop-shadow(0 0 60px gold);
          }
          70% {
            transform: scale(0.35) rotate(360deg) translateY(-15px);
            opacity: 1;
            filter: brightness(3) drop-shadow(0 0 80px white);
          }
          100% {
            transform: scale(0) rotate(720deg) translateY(0px);
            opacity: 0;
            filter: brightness(5) drop-shadow(0 0 100px white);
          }
        }

        /* 3. Teks muncul dari tengah */
        @keyframes text-materialize {
          0% {
            transform: scale(0.2);
            opacity: 0;
            letter-spacing: 0px;
            filter: blur(15px);
          }
          60% {
            transform: scale(1.15);
            opacity: 1;
            letter-spacing: 8px;
            filter: blur(0);
          }
          100% {
            transform: scale(1);
            opacity: 1;
            letter-spacing: 4px;
            filter: blur(0);
          }
        }

        /* 4. Sparkle */
        @keyframes sparkle-spin {
          0% { transform: rotate(0deg) scale(1); opacity: 0.8; }
          50% { transform: rotate(180deg) scale(1.3); opacity: 1; }
          100% { transform: rotate(360deg) scale(1); opacity: 0.8; }
        }

        .animate-solved-fly-out {
          animation: solved-fly-out 1s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
        }
        .animate-solved-suck-in {
          animation: solved-suck-in 1.4s cubic-bezier(0.5, 0, 0.3, 1) forwards;
        }
        .animate-text-materialize {
          animation: text-materialize 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-sparkle {
          animation: sparkle-spin 4s linear infinite;
        }

        .board-won-bg {
          background: radial-gradient(circle, #2a1a05 0%, #0a0500 100%) !important;
          box-shadow: inset 0 0 80px rgba(255, 215, 0, 0.3), inset 0 0 0 1px #8a6a25 !important;
        }
      `}</style>

      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
        <div className="relative w-full max-w-xl bg-cream-50 rounded-3xl p-5 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[96dvh] overflow-y-auto">

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-200/50 transition-colors z-20 bg-cream-50"
            aria-label="Tutup game"
          >
            <X className="w-4 h-4 text-neutral-600" />
          </button>

          {/* Header */}
          <div className="text-center mb-4 mt-1">
            <h2 className="font-condensed text-3xl md:text-4xl tracking-wider text-ink-900 mb-1">
              PUZZLE KENANGAN
            </h2>
            <p className="text-[11px] font-mono tracking-[0.14em] text-neutral-500 uppercase">
              {lockedCount} / {total} terpasang · {moves} langkah
            </p>
          </div>

          {/* ── KONFIGURASI DROPDOWN ── */}
          <div className="flex gap-2 mb-4 max-w-md mx-auto relative z-20">
            <div className="relative flex-1">
              <select
                value={difficulty}
                onChange={(e) => handleDifficultyChange(e.target.value as Difficulty)}
                disabled={isWon}
                className="w-full appearance-none bg-white border border-neutral-300 text-neutral-800 text-[11px] font-semibold tracking-wider uppercase rounded-full pl-4 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-ink-900 cursor-pointer disabled:opacity-50"
              >
                {DIFFICULTY_ORDER.map((d) => (
                  <option key={d} value={d}>
                    Level: {DIFFICULTY_CONFIG[d].label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
            </div>

            <div className="relative flex-1">
              <select
                value={photoIdx}
                onChange={(e) => setPhotoIdx(Number(e.target.value))}
                disabled={isWon}
                className="w-full appearance-none bg-white border border-neutral-300 text-neutral-800 text-[11px] font-semibold tracking-wider uppercase rounded-full pl-4 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-ink-900 cursor-pointer disabled:opacity-50"
              >
                {PHOTOS.map((p, i) => (
                  <option key={i} value={i}>
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
            </div>
          </div>

          {/* Board Area: lebar area ini diukur, lalu papan dihitung agar PASTI muat */}
          <div ref={areaRef} className="w-full mb-6 relative z-10">
            <div
              className="mx-auto"
              style={{ width: boardSize + tabPadding * 2, padding: tabPadding }}
            >
              <div
                className={`relative shrink-0 bg-neutral-100 rounded-xl shadow-inner ring-1 ring-inset ring-neutral-200 transition-all duration-1000 ${
                  isWon ? 'board-won-bg overflow-hidden' : ''
                }`}
                style={{
                  width: boardSize,
                  height: boardSize,
                  touchAction: 'none',
                }}
              >
                {/* Grid Hint */}
                {!isWon && (
                  <div
                    className="absolute inset-0 grid pointer-events-none opacity-20"
                    style={{
                      gridTemplateColumns: `repeat(${size}, 1fr)`,
                      gridTemplateRows: `repeat(${size}, 1fr)`,
                    }}
                  >
                    {Array.from({ length: total }).map((_, i) => (
                      <div key={i} className="border border-dashed border-neutral-400" />
                    ))}
                  </div>
                )}

                {/* Kepingan Puzzle */}
                {!isWon &&
                  pieces.map((piece) => {
                    const path = allPaths[piece.r]?.[piece.c];
                    if (!path) return null;
                    const isDragging = draggingId === piece.id;
                    return (
                      <div
                        key={piece.id}
                        className="absolute select-none"
                        style={{
                          width: svgSize,
                          height: svgSize,
                          left: piece.x * pieceSize - tabPadding,
                          top: piece.y * pieceSize - tabPadding,
                          zIndex: piece.locked ? 1 : isDragging ? 50 : 10,
                          cursor: piece.locked ? 'default' : isDragging ? 'grabbing' : 'grab',
                          filter: isDragging
                            ? 'drop-shadow(0 8px 14px rgba(0,0,0,0.3))'
                            : piece.locked
                              ? 'none'
                              : 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))',
                          touchAction: 'none',
                        }}
                        onPointerDown={(e) => handlePointerDown(e, piece)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                      >
                        <svg
                          viewBox="-30 -30 160 160"
                          width={svgSize}
                          height={svgSize}
                          style={{ overflow: 'visible', display: 'block' }}
                        >
                          <defs>
                            <clipPath id={`clip-${piece.id}`}>
                              <path d={path} />
                            </clipPath>
                          </defs>
                          <image
                            href={currentPhoto.src}
                            x={-piece.c * 100}
                            y={-piece.r * 100}
                            width={size * 100}
                            height={size * 100}
                            clipPath={`url(#clip-${piece.id})`}
                            preserveAspectRatio="xMidYMid slice"
                          />
                        </svg>
                      </div>
                    );
                  })}

                {/* Dekorasi Board saat Menang */}
                {isWon && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-amber-400/40 animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-3 relative z-20">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              disabled={isWon}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-semibold tracking-wider uppercase transition-all disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" />
              Lihat Foto
            </button>
            <button
              type="button"
              onClick={shuffle}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink-900 text-white hover:bg-black text-xs font-semibold tracking-wider uppercase transition-all"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Main Lagi
            </button>
          </div>

          {/* Tombol jebakan */}
          <div className="mt-6 flex justify-center relative z-20">
            <button
              type="button"
              onClick={triggerJumpscare}
              className="group text-[10px] font-mono tracking-[0.25em] uppercase text-red-400/70 hover:text-red-600 transition-all px-4 py-1.5 rounded-full border border-red-300/50 hover:border-red-500 hover:scale-105 active:scale-95"
            >
              ⚠ Jangan Disentuh ⚠
            </button>
          </div>

          {/* ── MODAL MENANG (Transisi Halus) ── */}
          {showWinModal && (
            <div className="absolute inset-0 bg-cream-50/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center text-center p-6 z-40 animate-in fade-in duration-1000">

              <Trophy className="w-20 h-20 text-amber-500 mb-4 animate-in slide-in-from-top-10 fade-in duration-700 delay-150 fill-amber-500/20" />

              <h3 className="font-condensed text-4xl tracking-wider text-ink-900 mb-3 animate-in zoom-in-95 fade-in duration-700 delay-200">
                PUZZLE SELESAI!
              </h3>

              <div className="relative mb-6 animate-in zoom-in-50 fade-in duration-700 delay-300">
                <img
                  src={currentPhoto.src}
                  alt={currentPhoto.label}
                  className="w-48 h-48 object-cover rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white"
                />
                <div className="absolute -inset-2 bg-amber-400/20 blur-xl -z-10 rounded-full animate-pulse"></div>
              </div>

              <p className="text-neutral-700 text-sm md:text-base leading-relaxed max-w-sm mb-2 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-400">
                Level{' '}
                <span className="font-semibold text-ink-900">
                  {DIFFICULTY_CONFIG[difficulty].label}
                </span>{' '}
                selesai dalam{' '}
                <span className="font-semibold text-ink-900">{moves} langkah</span>.
              </p>

              <p className="text-neutral-700 text-sm md:text-base leading-relaxed max-w-sm mb-8 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-500">
                Setiap kepingan punya tempatnya — sama seperti kamu di hatiku. ❤️
              </p>

              <div className="flex gap-3 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-600">
                <button
                  type="button"
                  onClick={shuffle}
                  className="px-8 py-3 rounded-full bg-ink-900 hover:bg-black text-white text-xs font-semibold tracking-wider uppercase transition-colors shadow-lg"
                >
                  Main Lagi
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 rounded-full bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-semibold tracking-wider uppercase transition-colors shadow-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          {/* Preview */}
          {showPreview && (
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-3xl flex items-center justify-center p-6 cursor-pointer z-30"
              onClick={() => setShowPreview(false)}
            >
              <img
                src={currentPhoto.src}
                alt={currentPhoto.label}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── FULLSCREEN ANIMATION OVERLAY (Fade-out saat modal muncul) ── */}
      {isWon && (
        <div
          className={`fixed inset-0 z-[70] pointer-events-none flex items-center justify-center overflow-hidden transition-opacity duration-1000 ${
            showWinModal ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Latar Belakang Gelap */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

          {/* Cahaya di tengah */}
          <div
            className="absolute w-[70vmin] h-[70vmin] max-w-[700px] max-h-[700px] rounded-full blur-3xl opacity-50 animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(255,215,0,0.5) 0%, rgba(255,215,0,0) 70%)',
            }}
          />

          {/* Gambar utama */}
          <img
            src={currentPhoto.src}
            alt="Puzzle Solved"
            className={`relative object-contain rounded-2xl border-4 border-amber-200/70 shadow-[0_30px_80px_rgba(0,0,0,0.8)] pointer-events-none ${
              isSuckingIn ? 'animate-solved-suck-in' : 'animate-solved-fly-out'
            }`}
            style={{
              width: 'auto',
              height: 'auto',
              maxWidth: '75vw',
              maxHeight: '75vh',
            }}
          />

          {/* Efek kilau */}
          {!isSuckingIn && (
            <>
              <Sparkles className="absolute w-14 h-14 text-amber-300 animate-sparkle" style={{ top: '20%', right: '20%' }} />
              <Sparkles className="absolute w-10 h-10 text-amber-200 animate-sparkle" style={{ bottom: '20%', left: '22%', animationDelay: '1s' }} />
            </>
          )}

          {/* Teks "PUZZLE SELESAI" di tengah */}
          {isSuckingIn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="absolute w-72 h-72 rounded-full blur-3xl opacity-80 animate-pulse"
                style={{
                  background: 'radial-gradient(circle, rgba(255,215,0,0.9) 0%, rgba(255,215,0,0) 70%)',
                }}
              />
              <h1 className="relative font-condensed text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-widest uppercase text-center animate-text-materialize drop-shadow-[0_0_30px_rgba(255,215,0,1)] leading-tight">
                Puzzle
                <br />
                Selesai!
              </h1>
              <Sparkles className="absolute w-10 h-10 text-amber-300 top-1/3 right-1/3 animate-sparkle" />
              <Sparkles className="absolute w-8 h-8 text-amber-200 bottom-1/3 left-1/3 animate-sparkle" style={{ animationDelay: '1s' }} />
            </div>
          )}
        </div>
      )}

      {/* ── Jumpscare Overlay ──────────────────────────────── */}
      <JumpscareOverlay
        isActive={jumpscare}
        onEnd={() => setJumpscare(false)}
      />
    </>
  );
};