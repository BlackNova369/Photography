import React, { useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, Wind, Eye } from 'lucide-react';
import { ARTWORKS } from '../data/artworks';

type BreezeLevel = 'gentle' | 'natural' | 'off';
type WireTension = 'tight' | 'natural' | 'loose';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  breezeLevel: BreezeLevel;
  onBreezeChange: (level: BreezeLevel) => void;
  wireTension: WireTension;
  onTensionChange: (tension: WireTension) => void;
  isMuted: boolean;
  onToggleSound: () => void;
  currentIndex: number;
  onJumpToPrint: (index: number) => void;
}

// Nilai teknis tetap English (dipakai di App.tsx & HangingGallery3D)
const BREEZE_OPTIONS = ['off', 'gentle', 'natural'] as const;
const TENSION_OPTIONS = ['tight', 'natural', 'loose'] as const;

// Label tampilan Bahasa Indonesia
const BREEZE_LABELS: Record<(typeof BREEZE_OPTIONS)[number], string> = {
  off: 'Mati',
  gentle: 'Lembut',
  natural: 'Alami',
};

const TENSION_LABELS: Record<(typeof TENSION_OPTIONS)[number], string> = {
  tight: 'Kencang',
  natural: 'Alami',
  loose: 'Kendor',
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// ── Opsi 3-arah (dipakai bersama) ───────────────────────────────────────────

interface OptionGroupProps<T extends string> {
  label: string;
  icon: React.ReactNode;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}

function OptionGroup<T extends string>({
  label,
  icon,
  options,
  labels,
  value,
  onChange,
}: OptionGroupProps<T>) {
  return (
    <div role="group" aria-label={label}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div className="font-semibold text-xs tracking-wider uppercase text-neutral-800">
          {label}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            aria-pressed={value === opt}
            onClick={() => {
              onChange(opt);
            }}
            className={`py-2.5 sm:py-2 rounded-xl text-xs font-medium uppercase tracking-wider transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 ${
              value === opt
                ? 'bg-ink-900 text-white shadow-sm'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Modal ───────────────────────────────────────────────────────────────────

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  breezeLevel,
  onBreezeChange,
  wireTension,
  onTensionChange,
  isMuted,
  onToggleSound,
  currentIndex,
  onJumpToPrint,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Escape untuk menutup, Tab tetap di dalam dialog.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Fokus masuk saat buka, kembali saat tutup; kunci scroll halaman.
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Latar belakang */}
      <div
        className="absolute inset-0 bg-neutral-900/30 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-cream-50/95 border border-neutral-300 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl z-10 animate-in fade-in duration-200"
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
          <h2 id="settings-title" className="font-condensed text-2xl tracking-wider text-ink-900">
            PENGATURAN GALERI
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-200/50 transition-colors"
            aria-label="Tutup pengaturan"
          >
            <X className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        <div className="space-y-6 text-sm">
          {/* Musik Latar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-neutral-500" aria-hidden="true" />
              ) : (
                <Volume2 className="w-4 h-4 text-ink-900" aria-hidden="true" />
              )}
              <div>
                <div className="font-semibold text-xs tracking-wider uppercase text-neutral-800">
                  Musik Latar
                </div>
                <div className="text-[11px] text-neutral-500">
                  Soundtrack · otomatis diputar saat berkunjung
                </div>
              </div>
            </div>
            <button
              type="button"
              aria-pressed={!isMuted}
              aria-label="Musik latar"
              onClick={() => {
                onToggleSound();
              }}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                !isMuted
                  ? 'bg-ink-900 text-white'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {!isMuted ? 'AKTIF' : 'BISU'}
            </button>
          </div>

          <OptionGroup
            label="Gerakan Angin Karya"
            icon={<Wind className="w-4 h-4 text-neutral-500" aria-hidden="true" />}
            options={BREEZE_OPTIONS}
            labels={BREEZE_LABELS}
            value={breezeLevel}
            onChange={onBreezeChange}
          />

          <OptionGroup
            label="Ketegangan Tali Gantung"
            icon={<Eye className="w-4 h-4 text-neutral-500" aria-hidden="true" />}
            options={TENSION_OPTIONS}
            labels={TENSION_LABELS}
            value={wireTension}
            onChange={onTensionChange}
          />

          {/* Lompat ke Karya */}
          <div role="group" aria-label="Lompat ke karya">
            <div className="font-semibold text-xs tracking-wider uppercase text-neutral-800 mb-2">
              Lompat ke Karya
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ARTWORKS.map((_, i) => {
                const num = i + 1;
                const isCurrent = currentIndex === num;
                return (
                  <button
                    key={num}
                    type="button"
                    aria-label={`Karya ${num}`}
                    aria-current={isCurrent ? 'true' : undefined}
                    onClick={() => {
                      onJumpToPrint(num);
                      onClose();
                    }}
                    className={`w-10 h-10 sm:w-8 sm:h-8 rounded-lg font-mono text-xs font-medium transition-all ${
                      isCurrent
                        ? 'bg-ink-900 text-white shadow-sm'
                        : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-200/60'
                    }`}
                  >
                    {String(num).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-neutral-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-ink-900 hover:bg-black text-white text-xs font-semibold tracking-wider uppercase transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};