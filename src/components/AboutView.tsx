import React, { useState } from 'react';
import { X, Gamepad2 } from 'lucide-react';
import { BABY_IMAGES } from '../data/artworks';
import reward1 from '../assets/my best reward from baby/IMG_9206.jpeg';
import reward2 from '../assets/my best reward from baby/IMG_9211.jpeg';
import reward3 from '../assets/my best reward from baby/IMG_9225.jpeg';
import catVideo from '../assets/vid/cat.mp4';

interface PhotoCard {
  id: string;
  src: string;
  alt: string;
  caption: string;
  transform: string;
  boxShadow: string;
}

interface AboutViewProps {
  /** Callback saat tombol "Mulai Game" diklik.
   *  Kalau tidak diberikan, tombol menampilkan alert sementara. */
  onStartGame?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onStartGame }) => {
  const [modalImage, setModalImage] = useState<{ src: string; caption: string } | null>(null);

  const cards: PhotoCard[] = [
    {
      id: 'daeva',
      src: BABY_IMAGES[0],
      alt: 'Daeva',
      caption: 'FOR DAEVA — WITH ALL MY LOVE ❤️',
      transform: 'rotateY(-6deg) rotateX(3deg) rotateZ(1deg)',
      boxShadow: '-16px 20px 32px -10px rgba(0, 0, 0, 0.20), 0 6px 12px -4px rgba(0, 0, 0, 0.10)',
    },
    {
      id: 'reward-1',
      src: reward1,
      alt: 'My Best Reward 01',
      caption: 'MY BEST REWARD — 01',
      transform: 'rotateY(6deg) rotateX(2.5deg) rotateZ(-1.2deg)',
      boxShadow: '16px 20px 32px -10px rgba(0, 0, 0, 0.18), 0 6px 12px -4px rgba(0, 0, 0, 0.10)',
    },
    {
      id: 'reward-2',
      src: reward2,
      alt: 'My Best Reward 02',
      caption: 'MY BEST REWARD — 02',
      transform: 'rotateY(-5deg) rotateX(3deg) rotateZ(1.5deg)',
      boxShadow: '-15px 18px 30px -10px rgba(0, 0, 0, 0.20), 0 6px 12px -4px rgba(0, 0, 0, 0.10)',
    },
    {
      id: 'reward-3',
      src: reward3,
      alt: 'My Best Reward 03',
      caption: 'MY BEST REWARD — 03',
      transform: 'rotateY(5deg) rotateX(2deg) rotateZ(-1deg)',
      boxShadow: '15px 18px 30px -10px rgba(0, 0, 0, 0.18), 0 6px 12px -4px rgba(0, 0, 0, 0.10)',
    },
  ];

  const handleStartGame = () => {
    if (onStartGame) {
      onStartGame();
    } else {
      // fallback sementara: beri tahu user
      alert('Game belum tersedia. Hubungkan prop onStartGame!');
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-36 px-6 md:px-12 lg:px-16 max-w-[1500px] mx-auto animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Title & The Heartfelt Letter */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="font-condensed text-5xl sm:text-7xl md:text-[84px] lg:text-[96px] leading-[0.88] text-ink-900 tracking-tight mb-4">
            A LITTLE MESSAGE FOR YOU
          </h1>

          <div className="w-12 h-[1px] bg-neutral-300 mb-6" />

          <div className="space-y-5 text-neutral-700 text-sm sm:text-base leading-relaxed font-sans max-w-2xl">
            <p>
              Your smile, the little things I treasure, and a love that isn&apos;t always perfect. We&apos;ve had our arguments and found our way back to each other, but through it all, being with you has always brought me a sense of calm and comfort.
            </p>

            <p>
              I hope you never get tired of my silly antics and the little things I do that sometimes make you mad. I know I&apos;m not perfect, but I&apos;ll keep trying to become a better person for you, because you deserve the best version of me.
            </p>

            <p>
              Daeva, I hope you always stay the person I know and love, while continuing to grow into an even better version of yourself. I know we may not always understand each other, and there will be times when things get difficult, but I hope we keep choosing to understand each other, work things out, and grow together.
            </p>

            <p>
              Thank you so, so much for the wonderful gift you gave me. I&apos;m genuinely happy and grateful, not only because of the gift itself, but also because of the thought and love behind it. I promise to take good care of it, and I&apos;ll never forget what it means to me. It will always be something precious to me because it came from you.
            </p>

            <p>
              Thank you for staying by my side, keeping me company, and coming into my life. Sometimes, I think about how beautiful God&apos;s plans can be. Out of all the people in this world, somehow, our paths crossed, and I&apos;m truly grateful that they did. Meeting you is something I never want to take for granted. I just hope that, no matter what life brings us, we won&apos;t have to say goodbye to each other. I hope we can keep choosing one another, even when things aren&apos;t easy.
            </p>

            <p>
              Please stay by my side as I work toward my dreams and become the person I want to be. I know I still have a lot to learn, a lot to improve, and a long way to go. But one day, when I&apos;ve finally achieved my dreams, I hope you&apos;ll be there to see it all. Besides my family, I want you to be one of the people who gets to witness my journey, my struggles, my growth, and eventually, my success. I want to look back someday and be able to say that you were there with me through it all.
            </p>

            <p>
              Thank you for being part of my life, for your smile, for the little moments that mean so much to me, and for the comfort I find in being with you. No matter how imperfect we are, I&apos;m grateful for what we have and for all the memories we&apos;re still going to make together.
            </p>

            <p>
              I don&apos;t know exactly what the future holds for us, but I hope we get to discover it together. Let&apos;s keep growing, keep learning to understand each other, and keep becoming better versions of ourselves. And if there&apos;s one thing I truly hope for, it&apos;s that someday, when we look back at everything we&apos;ve been through, we&apos;ll be proud that we never gave up on each other.
            </p>

            <p className="font-medium text-ink-900 pt-2">
              I&apos;m grateful that life brought me to you, Daeva. I hope we&apos;ll always stay together, keep taking care of each other, and continue loving one another. Mwa. ❤️
            </p>
          </div>

          <div className="pt-6 border-t border-neutral-200/80 text-[11px] font-mono tracking-[0.18em] text-neutral-400 uppercase">
            — FOR DAEVA · ALWAYS & FOREVER
          </div>
        </div>

        {/* Right Column: Photo Grid + Signature + Video (sticky on desktop) */}
        <div className="lg:col-span-5 pt-4 lg:sticky lg:top-28 self-start">
          <div className="grid grid-cols-2 gap-5 sm:gap-6">
            {cards.map((card) => (
              <div
                key={card.id}
                className="relative w-full cursor-pointer transition-transform duration-500 ease-out hover:scale-[1.03]"
                style={{ perspective: '1000px' }}
                onClick={() => setModalImage({ src: card.src, caption: card.caption })}
              >
                {/* 3D Angled Board */}
                <div
                  className="relative rounded-xs overflow-hidden bg-[#EBE7DE] p-2 shadow-lg transition-all duration-500"
                  style={{
                    transform: card.transform,
                    boxShadow: card.boxShadow,
                  }}
                >
                  <img
                    src={card.src}
                    alt={card.alt}
                    className="w-full h-auto aspect-[4/5] object-cover rounded-2xs"
                  />
                </div>

                {/* Caption */}
                <div className="mt-3 text-[10px] font-mono tracking-[0.14em] text-neutral-400 uppercase text-center leading-tight">
                  {card.caption}
                </div>
              </div>
            ))}
          </div>

          {/* Divider + Signature Footer */}
          <div className="mt-10 pt-5 border-t border-neutral-200/80 flex flex-col items-center gap-4">
            {/* Row 1: Enlarged Heart + Name */}
            <div className="flex items-center justify-center gap-4 sm:gap-5">
              <svg
                viewBox="0 0 120 100"
                className="w-24 sm:w-28 lg:w-32 h-auto text-ink-900 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path
                  d="
                    M 60 78
                    C 60 78, 35 60, 25 40
                    C 18 25, 28 12, 42 15
                    C 52 17, 58 28, 60 38
                    M 60 38
                    C 63 22, 72 12, 86 12
                    C 102 12, 110 28, 103 45
                    C 95 65, 78 82, 63 90
                    C 58 93, 54 96, 57 99
                    C 60 101, 66 98, 64 93
                    C 62 88, 55 90, 45 92
                    C 32 95, 18 92, 8 84
                  "
                />
              </svg>

              <span
                className="text-4xl sm:text-5xl lg:text-6xl text-ink-900 leading-none translate-y-1.5"
                style={{
                  fontFamily:
                    "'Great Vibes', 'Parisienne', 'Allura', 'Dancing Script', cursive",
                }}
              >
                Created By
              </span>
            </div>

            {/* Row 2: Rano → Daeva (tanpa "from" & tanpa titik) */}
            <div className="flex items-baseline justify-center gap-2 sm:gap-3">
              <span
                className="text-lg sm:text-2xl text-ink-900 leading-none"
                style={{
                  fontFamily:
                    "'Great Vibes', 'Parisienne', 'Allura', 'Dancing Script', cursive",
                }}
              >
                Rano
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400">
                to
              </span>
              <span
                className="text-2xl sm:text-2xl text-ink-900 leading-none"
                style={{
                  fontFamily:
                    "'Great Vibes', 'Parisienne', 'Allura', 'Dancing Script', cursive",
                }}
              >
                Daeva
              </span>
            </div>

            {/* Row 3: Cat Video — slightly taller, no sound controls */}
            <div className="mt-6 w-full max-w-[340px] sm:max-w-[380px] mx-auto rounded-xl overflow-hidden shadow-md bg-neutral-100">
              <video
                src={catVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full aspect-[4/3] object-cover pointer-events-none"
              >
                Browser kamu tidak mendukung tag video.
              </video>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tombol Mulai Game ─────────────────────────────────── */}
      <div className="mt-16 pt-10 border-t border-neutral-200/80 flex justify-center">
        <button
          type="button"
          onClick={handleStartGame}
          className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-ink-900 hover:bg-black text-white text-sm font-semibold tracking-[0.18em] uppercase shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]"
        >
          <Gamepad2 className="w-5 h-5 transition-transform group-hover:rotate-12" />
          <span>Mulai Game</span>
        </button>
      </div>

      {/* Lightbox / Zoom Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setModalImage(null)}
        >
          <button
            onClick={() => setModalImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-10"
            aria-label="Close Preview"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImage.src}
              alt={modalImage.caption}
              className="max-w-full max-h-[80vh] object-contain rounded-md shadow-2xl border-4 border-white/90"
            />
            <div className="mt-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white font-mono text-xs tracking-wider">
              {modalImage.caption}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};