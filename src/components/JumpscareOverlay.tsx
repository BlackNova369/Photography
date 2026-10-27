import React, { useCallback, useEffect, useRef, useState } from 'react';
import scaryImage from '../assets/jumpscare/1.png';
import scarySound from '../assets/jumpscare/sound1.mp3';

interface JumpscareOverlayProps {
  isActive: boolean;
  onEnd?: () => void;
  /** Durasi gambar seram (ms, default 3500) */
  duration?: number;
  /** Durasi teks setelah jumpscare (ms, default 1500) */
  aftermathDuration?: number;
  /** Durasi fake error sebelum jumpscare (ms, default 1500) */
  errorDuration?: number;
  /** Durasi layar hitam sebelum jumpscare (ms, default 1500) */
  blackoutDuration?: number;
  message?: string;
  imageSrc?: string;
  soundSrc?: string;
  playSound?: boolean;
}

export const JumpscareOverlay: React.FC<JumpscareOverlayProps> = ({
  isActive,
  onEnd,
  duration = 3500,
  aftermathDuration = 1500,
  errorDuration = 1500,
  blackoutDuration = 1500,
  message = 'DI BILANG JANGAN DI SENTUH',
  imageSrc,
  soundSrc,
  playSound = true,
}) => {
  const [phase, setPhase] = useState<'error' | 'blackout' | 'scare' | 'aftermath'>('error');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Audio ──────────────────────────────────────────────
  const playScaryAudio = useCallback(() => {
    if (!playSound) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(soundSrc ?? scarySound);
        audioRef.current.preload = 'auto';
        audioRef.current.volume = 1;
      }
      audioRef.current.currentTime = 0.7;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, [playSound, soundSrc]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const triggerBlackout = useCallback(() => {
    setPhase((p) => {
      if (p !== 'error') return p;
      return 'blackout';
    });
  }, []);

  const triggerScare = useCallback(() => {
    setPhase((p) => {
      if (p !== 'blackout') return p;
      playScaryAudio();
      return 'scare';
    });
  }, [playScaryAudio]);

  useEffect(() => {
    if (isActive) {
      setPhase('error');
    } else {
      stopAudio();
    }
  }, [isActive, stopAudio]);

  useEffect(() => {
    if (!isActive || phase !== 'error') return;
    const t = window.setTimeout(triggerBlackout, errorDuration);
    return () => window.clearTimeout(t);
  }, [isActive, phase, errorDuration, triggerBlackout]);

  useEffect(() => {
    if (!isActive || phase !== 'blackout') return;
    const t = window.setTimeout(triggerScare, blackoutDuration);
    return () => window.clearTimeout(t);
  }, [isActive, phase, blackoutDuration, triggerScare]);

  useEffect(() => {
    if (!isActive || phase !== 'scare') return;
    const t = window.setTimeout(() => setPhase('aftermath'), duration);
    return () => window.clearTimeout(t);
  }, [isActive, phase, duration]);

  useEffect(() => {
    if (phase === 'aftermath') {
      stopAudio();
    }
  }, [phase, stopAudio]);

  useEffect(() => {
    if (!isActive || phase !== 'aftermath') return;
    const t = window.setTimeout(() => onEnd?.(), aftermathDuration);
    return () => window.clearTimeout(t);
  }, [isActive, phase, aftermathDuration, onEnd]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (!isActive) return null;

  return (
    <>
      <style>{`
        /* ── Fake error animations ───────────────────────── */
        @keyframes err-progress {
          0%   { width: 3%; }
          30%  { width: 42%; }
          60%  { width: 74%; }
          85%  { width: 87%; }
          100% { width: 87%; }
        }
        @keyframes err-blink {
          0%, 49%   { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes err-fadein {
          0%   { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .err-progress { animation: err-progress 1.3s ease-out forwards; }
        .err-blink    { animation: err-blink 1s steps(1) infinite; }
        .err-fadein   { animation: err-fadein 0.25s ease-out forwards; }

        /* ── Scare animations ────────────────────────────── */
        @keyframes js-shake {
          0%, 100% { transform: translate(0, 0) rotate(0); }
          10% { transform: translate(-8px, -4px) rotate(-1.5deg); }
          20% { transform: translate(8px, 4px) rotate(1.5deg); }
          30% { transform: translate(-6px, 3px) rotate(-1deg); }
          40% { transform: translate(6px, -3px) rotate(1deg); }
          50% { transform: translate(-5px, 3px) rotate(-0.75deg); }
          60% { transform: translate(5px, -3px) rotate(0.75deg); }
          70% { transform: translate(-4px, 2px) rotate(-0.5deg); }
          80% { transform: translate(4px, -2px) rotate(0.5deg); }
          90% { transform: translate(-2px, 1px) rotate(-0.25deg); }
        }

        /* Zoom keras: kecil → langsung besar */
        @keyframes js-zoom-hard {
          0%   { transform: scale(0.05); opacity: 0; }
          15%  { transform: scale(1.5);  opacity: 1; }
          100% { transform: scale(1.3);  opacity: 1; }
        }
        .js-zoom-hard {
          animation: js-zoom-hard 0.55s cubic-bezier(0.2, 0.9, 0.3, 1.1) forwards;
        }

        /* Fade-in teks setelah jumpscare (tanpa getar) */
        @keyframes js-text-fadein {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        .js-text-fadein { animation: js-text-fadein 0.6s ease-out forwards; }

        .js-shake { animation: js-shake 0.12s infinite; }
      `}</style>

      {/* ── PHASE 1: Fake Windows-style error dialog ─────── */}
      {phase === 'error' && (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-4 err-fadein select-none">
          <div className="w-full max-w-[440px] bg-[#1c1c1c] border border-[#3a3a3a] rounded-lg shadow-2xl text-white">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#2a2a2a] border-b border-[#3a3a3a] rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                <span className="text-[10px] sm:text-[11px] text-neutral-400 font-sans tracking-wide">
                  System Error
                </span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="text-red-500 text-3xl sm:text-5xl flex-shrink-0 leading-none">
                  ⚠
                </div>
                <div className="min-w-0">
                  <h2 className="text-white text-base sm:text-lg font-semibold mb-1.5 sm:mb-2 flex items-center gap-2 flex-wrap">
                    CRITICAL ERROR
                    <span className="inline-block w-2 h-4 bg-white err-blink" />
                  </h2>
                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    An unexpected error has occurred. The application will be
                    terminated.
                  </p>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-[#3a3a3a] rounded p-2.5 sm:p-3 font-mono text-[10px] sm:text-[11px] text-neutral-400 space-y-1 mb-4 sm:mb-5 break-all">
                <div>
                  <span className="text-red-400">ERR_CODE:</span> 0xC0000005
                </div>
                <div>
                  <span className="text-red-400">ADDRESS:</span> 0x7FFE92A4C
                </div>
                <div>
                  <span className="text-red-400">FILE:</span> happy.mp3
                </div>
                <div>
                  <span className="text-red-400">STATUS:</span> MEMORY_ACCESS_VIOLATION
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] sm:text-[11px] text-neutral-500 mb-1.5 font-mono">
                  <span>Dumping crash data...</span>
                  <span>87%</span>
                </div>
                <div className="h-2 bg-[#0a0a0a] rounded overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-700 to-red-500 err-progress" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t border-[#3a3a3a]">
              <button
                type="button"
                onClick={triggerBlackout}
                className="px-4 sm:px-6 py-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-neutral-300 rounded text-xs sm:text-sm transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={triggerBlackout}
                className="px-4 sm:px-6 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded text-xs sm:text-sm transition-colors"
              >
                Send Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PHASE 2: Blackscreen (Hening) ───────────────── */}
      {phase === 'blackout' && (
        <div className="fixed inset-0 z-[9999] bg-black pointer-events-none" />
      )}

      {/* ── PHASE 3: Jumpscare dengan zoom keras ─────────── */}
      {phase === 'scare' && (
        <div className="fixed inset-0 z-[9999] overflow-hidden bg-black pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center js-shake">
            <img
              src={imageSrc ?? scaryImage}
              alt=""
              className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain js-zoom-hard select-none"
              draggable={false}
              style={{
                filter: 'brightness(1.05) contrast(1.15) saturate(1.1)',
              }}
            />
          </div>
        </div>
      )}

      {/* ── PHASE 4: Teks setelah jumpscare (tanpa getar/merah) ── */}
      {phase === 'aftermath' && (
        <div className="fixed inset-0 z-[9999] overflow-hidden bg-black pointer-events-none flex items-center justify-center">
          <div className="js-text-fadein px-6">
            <h2
              className="font-black uppercase text-white text-center tracking-wider select-none"
              style={{
                fontSize: 'clamp(24px, 7vw, 80px)',
                letterSpacing: '0.05em',
              }}
            >
              {message}
            </h2>
          </div>
        </div>
      )}
    </>
  );
};