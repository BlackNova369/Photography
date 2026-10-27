import React, { useState, useEffect } from 'react';
import { Navigation, PageId } from './components/Navigation';
import { HangingGallery3D } from './components/HangingGallery3D';
import { PlateViewerModal } from './components/PlateViewerModal';
import { ArtworkViewer } from './components/ArtworkViewer';
import { LightTableGallery } from './components/LightTableGallery';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { SettingsModal } from './components/SettingsModal';
import { AudioAutostart } from './components/AudioAutostart';
import { PuzzleGameModal } from './components/PuzzleGameModal';
import { ARTWORKS, Artwork } from './data/artworks';
import { sound } from './utils/audio';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('main');
  const [selectedArtworkId, setSelectedArtworkId] = useState<string>('ridge-walker');
  const [currentPrintIndex, setCurrentPrintIndex] = useState<number>(1);
  const [previewArtwork, setPreviewArtwork] = useState<Artwork | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [breezeLevel, setBreezeLevel] = useState<'gentle' | 'natural' | 'off'>('natural');
  const [wireTension, setWireTension] = useState<'tight' | 'natural' | 'loose'>('natural');
  // Musik auto-play: default tidak mute
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [inquirySubject, setInquirySubject] = useState<string>('');
  // State untuk membuka puzzle game
  const [isGameOpen, setIsGameOpen] = useState<boolean>(false);

  // Sinkronkan mute state React → audio engine
  useEffect(() => {
    sound.setMuted(isMuted);
  }, [isMuted]);

  // Handle URL hash changes for direct URL access and browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      if (hash.startsWith('/work/')) {
        const id = hash.replace('/work/', '');
        setSelectedArtworkId(id);
        setCurrentPage('work-detail');
      } else if (hash === '/work') {
        setCurrentPage('main');
        window.location.hash = '/';
      } else if (hash === '/gallery') {
        setCurrentPage('gallery');
      } else if (hash === '/about') {
        setCurrentPage('about');
      } else if (hash === '/contact') {
        setCurrentPage('contact');
      } else {
        setCurrentPage('main');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: PageId, extraId?: string) => {
    setPreviewArtwork(null);
    setCurrentPage(page);

    if (page === 'main') {
      window.location.hash = '/';
    } else if (page === 'work') {
      window.location.hash = '/';
    } else if (page === 'work-detail') {
      const id = extraId || selectedArtworkId;
      setSelectedArtworkId(id);
      window.location.hash = `/work/${id}`;
    } else if (page === 'gallery') {
      window.location.hash = '/gallery';
    } else if (page === 'about') {
      window.location.hash = '/about';
    } else if (page === 'contact') {
      window.location.hash = '/contact';
    }
  };

  const handleSelectArtworkFrom3D = (artwork: Artwork) => {
    setPreviewArtwork(artwork);
  };

  const handleEnquireFromDetail = (artworkTitle: string) => {
    setInquirySubject(artworkTitle);
    navigateTo('contact');
  };

  // Toggle musik: cukup balik state React, sync ke engine via useEffect
  const handleToggleSound = () => {
    setIsMuted((m) => !m);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F6F5F2] text-[#111111] overflow-x-hidden font-sans">
      {/* Auto-play background music saat website dibuka */}
      <AudioAutostart muted={isMuted} />

      {/* Soft atmospheric vignette glow */}
      <div className="vignette-overlay" />

      {/* Global Navigation Bar & Capsule Dock */}
      <Navigation
        currentPage={currentPage}
        onNavigate={navigateTo}
        currentPrintIndex={currentPrintIndex}
        totalPrints={ARTWORKS.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Page Content */}
      <main className="w-full">
        {currentPage === 'main' && (
          <>
            <HangingGallery3D
              onSelectArtwork={handleSelectArtworkFrom3D}
              onIndexChange={setCurrentPrintIndex}
              breezeLevel={breezeLevel}
              wireTension={wireTension}
            />

            {/* Click-to-plate zoom modal on main page */}
            <PlateViewerModal
              artwork={previewArtwork}
              onClose={() => setPreviewArtwork(null)}
            />
          </>
        )}

        {currentPage === 'work-detail' && (
          <ArtworkViewer
            artworkId={selectedArtworkId}
            onNavigateArtwork={(id) => {
              setSelectedArtworkId(id);
              window.location.hash = `/work/${id}`;
            }}
            onEnquire={handleEnquireFromDetail}
          />
        )}

        {currentPage === 'gallery' && <LightTableGallery />}

        {currentPage === 'about' && (
          <AboutView onStartGame={() => setIsGameOpen(true)} />
        )}

        {currentPage === 'contact' && <ContactView initialSubject={inquirySubject} />}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        breezeLevel={breezeLevel}
        onBreezeChange={setBreezeLevel}
        wireTension={wireTension}
        onTensionChange={setWireTension}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        currentIndex={currentPrintIndex}
        onJumpToPrint={(num) => {
          setCurrentPrintIndex(num);
        }}
      />

      {/* Puzzle Game Modal — dibuka dari tombol "Mulai Game" di AboutView */}
      {isGameOpen && (
        <PuzzleGameModal onClose={() => setIsGameOpen(false)} />
      )}
    </div>
  );
};