import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { ARTWORKS, Artwork } from '../data/artworks';
import { sound } from '../utils/audio';

interface ArtworkViewerProps {
  artworkId: string;
  onNavigateArtwork: (artworkId: string) => void;
  onEnquire: (artworkTitle: string) => void;
}

export const ArtworkViewer: React.FC<ArtworkViewerProps> = ({
  artworkId,
  onNavigateArtwork,
  onEnquire,
}) => {
  const currentIndex = ARTWORKS.findIndex((a) => a.id === artworkId);
  const artwork = ARTWORKS[currentIndex >= 0 ? currentIndex : 0];
  const nextArtwork = ARTWORKS[(currentIndex + 1) % ARTWORKS.length];

  const plates = artwork.plates || [
    {
      caption: `PLATE 01 — ${artwork.title.toUpperCase()} · ${artwork.place}`,
      image: artwork.image,
      index: '01 / 01',
    },
  ];

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 md:px-12 lg:px-16 max-w-[1550px] mx-auto animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Number, Title, Metadata Specs, Actions */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <h1 className="font-condensed text-7xl sm:text-8xl md:text-[110px] leading-[0.84] text-ink-900 tracking-tight mb-6">
            {artwork.number}
          </h1>

          <div className="w-12 h-[1px] bg-neutral-300 mb-6" />

          <h2 className="text-2xl sm:text-3xl font-normal text-ink-900 mb-3">
            {artwork.title}
          </h2>

          <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed mb-8 max-w-md">
            {artwork.description}
          </p>

          {/* Metadata Specifications Table */}
          <div className="border-t border-neutral-200 divide-y divide-neutral-200 text-xs mb-8">
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wider text-neutral-400 uppercase">PLACE</span>
              <span className="font-mono text-neutral-800 uppercase">{artwork.place}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wider text-neutral-400 uppercase">COUNTRY</span>
              <span className="font-mono text-neutral-800 uppercase">{artwork.country}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wider text-neutral-400 uppercase">YEAR</span>
              <span className="font-mono text-neutral-800">{artwork.year}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wider text-neutral-400 uppercase">CAMERA</span>
              <span className="font-mono text-neutral-800 uppercase">{artwork.camera}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wider text-neutral-400 uppercase">SETTINGS</span>
              <span className="font-mono text-neutral-800 uppercase">{artwork.settings}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wider text-neutral-400 uppercase">SERIES</span>
              <span className="font-mono text-neutral-800 uppercase">{artwork.series}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wider text-neutral-400 uppercase">EDITION</span>
              <span className="font-mono text-neutral-800 uppercase">{artwork.edition}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => onEnquire(artwork.title)}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-ink-900 hover:bg-black text-white text-xs font-semibold tracking-[0.14em] uppercase transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
            >
              <span>ENQUIRE ABOUT THIS PRINT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playTick(560);
                onNavigateArtwork(nextArtwork.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-white/80 hover:bg-white text-neutral-800 border border-neutral-300 text-xs font-semibold tracking-[0.12em] uppercase transition-all shadow-sm active:scale-[0.99]"
            >
              <span>NEXT — {nextArtwork.title}</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Right Column: Full Photographic Plates */}
        <div className="lg:col-span-7 space-y-12">
          {plates.map((plate, idx) => (
            <div key={idx} className="space-y-3 group">
              <div className="relative w-full rounded-xs overflow-hidden bg-[#EBE7DE] p-2 sm:p-3 shadow-xl transition-all duration-300">
                <img
                  src={plate.image}
                  alt={plate.caption}
                  className="w-full h-auto object-cover rounded-2xs"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </div>

              {/* Plate Caption and Index */}
              <div className="flex items-center justify-between text-[11px] font-mono tracking-[0.14em] text-neutral-500 uppercase px-1">
                <span>{plate.caption}</span>
                <span>{plate.index}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
