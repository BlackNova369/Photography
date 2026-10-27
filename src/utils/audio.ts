// Background music player + small UI sound effects.
// Musik fisik ada di src/assets/music/happy.mp3 → di-import via Vite.

import happyTrack from '../assets/music/happy.mp3';

const MUSIC_TRACKS = [happyTrack];

const MUSIC_VOLUME = 0.35;
const FADE_MS = 50;
const FADE_STEPS = 30; // total ~1.5s fade-in

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Musik background
  private musicEl: HTMLAudioElement | null = null;
  private musicStarted = false;

  // ── Web Audio context (untuk tick / paper lift) ────────────
  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ── Mute / unmute ──────────────────────────────────────────
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setMuted(this.isMuted);
    return !this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /** Set mute state dari luar (mis. dari React state). */
  public setMuted(muted: boolean) {
    this.isMuted = muted;
    const el = this.initMusic();
    el.muted = muted;
    if (!muted && this.musicStarted) {
      el.play().catch(() => {});
    }
  }

  // ── UI sounds (tick, paper lift) ───────────────────────────
  public playTick(freq = 600, duration = 0.03) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        120,
        this.ctx.currentTime + duration,
      );
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + duration,
      );
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio failure
    }
  }

  public playPaperLift() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.08);
    } catch {
      // Audio error safely caught
    }
  }

  // ── Background music ───────────────────────────────────────
  private initMusic(): HTMLAudioElement {
    if (this.musicEl) return this.musicEl;

    const el = new Audio();
    el.loop = true;
    el.volume = 0;
    el.preload = 'auto';
    el.muted = this.isMuted;
    el.src = MUSIC_TRACKS[0];

    el.addEventListener('error', () => {
      // eslint-disable-next-line no-console
      console.warn('[audio] gagal load musik:', el.src);
    });

    this.musicEl = el;
    return el;
  }

  /**
   * Coba mulai musik background.
   * Return true kalau benar-benar diputar (tidak diblokir browser).
   * Fade-in halus dari 0 → MUSIC_VOLUME.
   */
  public async startMusic(): Promise<boolean> {
    const el = this.initMusic();
    if (this.musicStarted && !el.paused) return true;

    try {
      el.muted = this.isMuted;
      el.volume = 0;
      await el.play();
      this.musicStarted = true;

      // Fade-in
      const step = MUSIC_VOLUME / FADE_STEPS;
      const iv = window.setInterval(() => {
        if (!this.musicEl) return;
        el.volume = Math.min(MUSIC_VOLUME, el.volume + step);
        if (el.volume >= MUSIC_VOLUME) window.clearInterval(iv);
      }, FADE_MS);

      return true;
    } catch {
      // Autoplay diblokir browser — fallback ditangani AudioAutostart
      return false;
    }
  }

  public pauseMusic() {
    this.musicEl?.pause();
  }

  public resumeMusic() {
    this.musicEl?.play().catch(() => {});
  }

  public isMusicPlaying(): boolean {
    return !!this.musicEl && !this.musicEl.paused;
  }
}

export const sound = new SoundManager();