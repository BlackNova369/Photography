import { useEffect } from 'react';
import { sound } from '../utils/audio';

interface AudioAutostartProps {
  muted: boolean;
}

/**
 * Auto-play musik saat website dibuka.
 * Kalau browser memblokir, musik mulai pada interaksi pertama user.
 */
export function AudioAutostart({ muted }: AudioAutostartProps) {
  // Sinkron mute state React → audio engine
  useEffect(() => {
    sound.setMuted(muted);
  }, [muted]);

  // Coba autoplay saat mount + fallback pada gesture pertama
  useEffect(() => {
    let unlocked = sound.isMusicPlaying();
    let cleanup = () => {};

    const begin = async () => {
      if (unlocked) return;
      const ok = await sound.startMusic();
      if (ok) unlocked = true;
    };

    begin();

    const unlock = async () => {
      if (unlocked) return;
      const ok = await sound.startMusic();
      if (ok) {
        unlocked = true;
        cleanup();
      }
    };

    const events: (keyof WindowEventMap)[] = [
      'pointerdown',
      'keydown',
      'touchstart',
    ];
    events.forEach((e) => window.addEventListener(e, unlock));

    cleanup = () =>
      events.forEach((e) => window.removeEventListener(e, unlock));

    return cleanup;
  }, []);

  return null;
}