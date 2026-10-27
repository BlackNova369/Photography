import React from 'react';
import { SlidersHorizontal, ArrowLeft } from 'lucide-react';

export type PageId = 'main' | 'work' | 'work-detail' | 'gallery' | 'about' | 'contact';

interface NavigationProps {
  currentPage: PageId;
  onNavigate: (page: PageId, extraId?: string) => void;
  currentPrintIndex?: number;
  totalPrints?: number;
  onOpenSettings?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  currentPrintIndex = 1,
  totalPrints = 11,
  onOpenSettings,
}) => {
  const formattedIndex = String(currentPrintIndex).padStart(2, '0');
  const formattedTotal = String(totalPrints).padStart(2, '0');

  return (
    <>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 p-4 sm:p-6 md:p-8 flex items-center justify-between pointer-events-none">
        {/* Brand Pill */}
        <div className="pointer-events-auto">
          <button
            onClick={() => onNavigate('main')}
            className="group px-4 sm:px-5 py-2 rounded-full bg-white/85 hover:bg-white text-ink-900 border border-neutral-300/80 backdrop-blur-md text-[11px] font-bold tracking-[0.18em] uppercase transition-all duration-200 shadow-sm hover:shadow active:scale-95"
            aria-label="FOR U DAEVA"
          >
            FOR U DAEVA
          </button>
        </div>

        {/* Top Right Status Badge / Actions */}
        <div className="pointer-events-auto flex items-center gap-2">
          {currentPage === 'work-detail' && (
            <button
              onClick={() => onNavigate('main')}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-white/85 hover:bg-white text-ink-900 border border-neutral-300/80 backdrop-blur-md text-[11px] font-semibold tracking-[0.14em] uppercase transition-all duration-200 shadow-sm hover:shadow"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">HOME</span>
            </button>
          )}

          <div className="px-3.5 sm:px-4 py-2 rounded-full bg-white/85 border border-neutral-300/80 backdrop-blur-md text-[11px] font-mono font-medium tracking-[0.12em] text-neutral-800 shadow-sm flex items-center gap-2">
            {currentPage === 'main' && `${formattedIndex} — ${formattedTotal}`}
            {currentPage === 'work-detail' && `${formattedIndex} — ${formattedTotal}`}
            {currentPage === 'gallery' && 'FRAMES'}
            {currentPage === 'about' && (
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-[10px] sm:text-[11px]">MESSAGE FOR YOU</span>
              </span>
            )}
            {currentPage === 'contact' && (
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-[10px] sm:text-[11px]">KRITIK & SARAN</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Floating Navigation Dock */}
      <nav 
        aria-label="Main Navigation"
        className="fixed bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[94vw]"
      >
        <div className="glass-dock p-1 sm:p-1.5 rounded-full flex items-center gap-0.5 sm:gap-1">
          {(
            [
              { id: 'main', label: 'MAIN', shortLabel: 'MAIN' },
              { id: 'gallery', label: 'GALLERY', shortLabel: 'GALLERY' },
              { id: 'about', label: 'A LITTLE MESSAGE FOR YOU', shortLabel: 'FOR YOU' },
              // Mengubah CONTACT menjadi SEND ME / SEND
              { id: 'contact', label: 'SEND ME', shortLabel: 'SEND' },
            ] as const
          ).map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold tracking-[0.1em] sm:tracking-[0.14em] transition-all duration-200 ${
                  isActive
                    ? 'bg-ink-900 text-white shadow-sm'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-200/50'
                }`}
              >
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Left Settings Pill (shown on Main page) */}
      {currentPage === 'main' && onOpenSettings && (
        <div className="fixed bottom-16 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 z-40 pointer-events-auto">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/85 hover:bg-white text-ink-900 border border-neutral-300/80 backdrop-blur-md text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] uppercase transition-all duration-200 shadow-sm hover:shadow active:scale-95"
            aria-label="Open Settings"
          >
            <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">SETTINGS</span>
          </button>
        </div>
      )}
    </>
  );
};