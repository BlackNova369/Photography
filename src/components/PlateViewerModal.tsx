import React, { useEffect } from 'react';
import { Artwork } from '../data/artworks';

interface PlateViewerModalProps {
  artwork: Artwork | null;
  onClose: () => void;
}

export const PlateViewerModal: React.FC<PlateViewerModalProps> = ({
  artwork,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!artwork) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-6 md:p-12 lg:p-16 animate-in fade-in duration-300">
      {/* Background Dim Backdrop */}
      <div
        className="absolute inset-0 bg-[#F6F5F2]/85 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-7xl h-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 z-10 pointer-events-auto">
        {/* Left Column: Metadata & Actions */}
        <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col justify-center">
          <h1 className="font-condensed text-7xl md:text-8xl lg:text-[100px] leading-[0.88] tracking-tight text-ink-900 mb-6">
            FOR U DAEVA 
          </h1>

          <div className="w-12 h-[1px] bg-neutral-300 mb-6" />

          <h2 className="text-2xl md:text-3xl font-normal text-ink-900 mb-2">
            {artwork.title}
          </h2>

          <div className="text-[11px] font-mono tracking-[0.14em] text-neutral-500 uppercase mb-3">
            {artwork.place} · {artwork.year}
          </div>

          <div className="text-[11px] font-mono tracking-[0.1em] text-neutral-600 uppercase mb-5 leading-relaxed">
            {artwork.camera} · {artwork.settings} · {artwork.series}
          </div>

          <p className="text-neutral-600 text-sm md:text-base leading-relaxed mb-8 max-w-sm">
            {artwork.description}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-50 text-ink-900 border border-neutral-300 text-xs font-semibold tracking-[0.12em] uppercase transition-all shadow-sm active:scale-95"
            >
              Close
            </button>
          </div>
        </div>

        {/* Right Column: Large Plate Framing */}
        <div className="w-full flex-1 h-[50vh] lg:h-[75vh] flex items-center justify-center">
          <div className="relative max-h-full max-w-full rounded-sm overflow-hidden shadow-2xl transition-transform duration-500 ease-out bg-[#EBE7DE] p-2 md:p-3">
            <img
              src={artwork.image}
              alt={artwork.title}
              className="max-h-[46vh] lg:max-h-[70vh] w-auto object-contain rounded-xs shadow-inner"
            />
          </div>
        </div>
      </div>
    </div>
  );
};