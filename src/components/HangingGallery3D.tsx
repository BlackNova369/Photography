import React, { useRef, useState, useEffect, useLayoutEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { ARTWORKS, Artwork } from '../data/artworks';
import { sound } from '../utils/audio';

ARTWORKS.forEach((artwork) => {
  useTexture.preload(artwork.image);
});

type BreezeLevel = 'gentle' | 'natural' | 'off';
type WireTension = 'tight' | 'natural' | 'loose';

interface HangingGallery3DProps {
  onSelectArtwork: (artwork: Artwork) => void;
  onIndexChange: (index: number) => void;
  breezeLevel: BreezeLevel;
  wireTension: WireTension;
}

// ── Layout constants ────────────────────────────────────────────────────────

const PRINT_WIDTH = 5.2;
const PRINT_HEIGHT = 3.5;
const PRINT_ASPECT = PRINT_WIDTH / PRINT_HEIGHT;

const X_STEP = 1.62;
const Y_STEP = 0.84;
const Z_STEP = -0.52;

const PEG_X_OFFSET = -PRINT_WIDTH * 0.44;
const PEG_Y_OFFSET = PRINT_HEIGHT / 2 + 0.08;

const ORIGIN_X = -2.15;
const ORIGIN_Y = -3.22;
const ORIGIN_Z = 0.5;

const N_PRINTS = ARTWORKS.length;
const VISIBLE_CENTER = 3.5;
const VIS_MIN = -2.5;
const VIS_MAX = 9.5;

const DRAG_THRESHOLD = 5; // px
const DRAG_SENSITIVITY = 0.0035;
const WHEEL_SENSITIVITY = 0.002;
const SCROLL_SMOOTHING = 7.5; // higher = snappier

// ── Peg ─────────────────────────────────────────────────────────────────────

const RealisticWoodenPeg: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[-0.032, 0.05, 0]} castShadow>
      <boxGeometry args={[0.034, 0.38, 0.046]} />
      <meshStandardMaterial color="#DAC6A4" roughness={0.76} metalness={0.02} />
    </mesh>
    <mesh position={[0.032, 0.05, 0]} castShadow>
      <boxGeometry args={[0.034, 0.38, 0.046]} />
      <meshStandardMaterial color="#CBB28C" roughness={0.76} metalness={0.02} />
    </mesh>
    <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.03, 0.03, 0.088, 16]} />
      <meshStandardMaterial color="#888E94" roughness={0.3} metalness={0.82} />
    </mesh>
  </group>
);

// ── Scroll driver dengan Inersia ────────────────────────────────────────────

const ScrollRig: React.FC<{
  targetOffset: React.MutableRefObject<number>;
  smoothOffset: React.MutableRefObject<number>;
  velocity: React.MutableRefObject<number>;
  isDragging: React.MutableRefObject<boolean>;
  onIndexChange: (index: number) => void;
}> = ({ targetOffset, smoothOffset, velocity, isDragging, onIndexChange }) => {
  const lastActive = useRef(-1);
  const callback = useRef(onIndexChange);
  callback.current = onIndexChange;

  useFrame((_, delta) => {
    // ── MOMENTUM / INERTIA LOGIC ──
    // Jika pengguna tidak sedang menekan layar, lanjutkan pergerakan dengan kecepatan sisa
    if (!isDragging.current && Math.abs(velocity.current) > 0.0001) {
      targetOffset.current += velocity.current;
      // Friksi/Gesekan (angka 0.95 berarti kecepatan berkurang 5% tiap frame)
      velocity.current *= Math.pow(0.95, delta * 60);
    } else if (Math.abs(velocity.current) <= 0.0001) {
      velocity.current = 0;
    }

    // Smoothing posisi agar tidak terlalu kaku
    const diff = targetOffset.current - smoothOffset.current;
    smoothOffset.current =
      Math.abs(diff) < 0.0005
        ? targetOffset.current
        : smoothOffset.current + diff * (1 - Math.exp(-delta * SCROLL_SMOOTHING));

    const wrapped = ((Math.round(smoothOffset.current) % N_PRINTS) + N_PRINTS) % N_PRINTS;
    const active = wrapped + 1;
    if (active !== lastActive.current) {
      lastActive.current = active;
      callback.current(active);
    }
  });

  return null;
};

// ── Print ───────────────────────────────────────────────────────────────────

interface HangingPrintProps {
  artwork: Artwork;
  index: number;
  offsetRef: React.MutableRefObject<number>;
  breezeLevel: BreezeLevel;
  onHover: (index: number | null) => void;
  onSelect: (artwork: Artwork) => void;
  isHovered: boolean;
  isDraggingRef: React.MutableRefObject<boolean>;
}

const HangingPrint: React.FC<HangingPrintProps> = ({
  artwork,
  index,
  offsetRef,
  breezeLevel,
  onHover,
  onSelect,
  isHovered,
  isDraggingRef,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useTexture(artwork.image);
  const gl = useThree((s) => s.gl);
  const targetScale = useMemo(() => new THREE.Vector3(), []);

  useLayoutEffect(() => {
    const img = texture.image as { width?: number; height?: number } | undefined;
    if (img?.width && img?.height) {
      const imgAspect = img.width / img.height;
      if (imgAspect > PRINT_ASPECT) {
        texture.repeat.set(PRINT_ASPECT / imgAspect, 1);
        texture.offset.set((1 - texture.repeat.x) / 2, 0);
      } else {
        texture.repeat.set(1, imgAspect / PRINT_ASPECT);
        texture.offset.set(0, (1 - texture.repeat.y) / 2);
      }
    }
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    texture.needsUpdate = true;
  }, [texture, gl]);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;

    const rawDist = index - offsetRef.current;
    const k = Math.round((VISIBLE_CENTER - rawDist) / N_PRINTS);
    const dist = rawDist + k * N_PRINTS;

    g.visible = dist >= VIS_MIN && dist <= VIS_MAX;
    if (!g.visible) return;

    g.position.set(
      ORIGIN_X + dist * X_STEP,
      ORIGIN_Y + dist * Y_STEP,
      ORIGIN_Z + dist * Z_STEP
    );

    let swayX = 0;
    let swayZ = 0;
    if (breezeLevel !== 'off') {
      const speed = breezeLevel === 'natural' ? 1.2 : 0.7;
      const amp = breezeLevel === 'natural' ? 0.016 : 0.008;
      const t = state.clock.getElapsedTime() * speed + index * 0.5;
      swayX = Math.sin(t) * amp;
      swayZ = Math.cos(t * 0.8) * (amp * 0.4);
    }

    const hoverLiftX = isHovered ? -0.06 : 0;
    const hoverScale = isHovered ? 1.02 : 1;

    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, swayX + hoverLiftX + 0.02, 0.1);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, -0.08, 0.1);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, swayZ - 0.038, 0.1);
    g.scale.lerp(targetScale.setScalar(hoverScale), 0.1);
  });

  return (
    <group
      ref={groupRef}
      renderOrder={20 - index}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (e.pointerType === 'touch' || isDraggingRef.current) return;
        onHover(index);
        sound.playPaperLift();
      }}
      onPointerOut={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        if (e.delta > DRAG_THRESHOLD) return;
        onSelect(artwork);
        sound.playTick(680);
      }}
    >
      <RealisticWoodenPeg position={[PEG_X_OFFSET, PEG_Y_OFFSET, 0.024]} />

      <mesh castShadow receiveShadow>
        <boxGeometry args={[PRINT_WIDTH + 0.16, PRINT_HEIGHT + 0.16, 0.03]} />
        <meshStandardMaterial color="#F0EDE6" roughness={0.92} metalness={0.02} />
      </mesh>

      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[PRINT_WIDTH, PRINT_HEIGHT]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      <mesh position={[-0.14, -0.14, -0.05]}>
        <planeGeometry args={[PRINT_WIDTH + 0.35, PRINT_HEIGHT + 0.35]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.1} depthWrite={false} />
      </mesh>
    </group>
  );
};

// ── Wire ────────────────────────────────────────────────────────────────────

const ContinuousWire: React.FC<{
  offsetRef: React.MutableRefObject<number>;
  tension: WireTension;
}> = ({ offsetRef, tension }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const sagFactor = tension === 'tight' ? 0.012 : tension === 'loose' ? 0.06 : 0.022;

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const startDist = -N_PRINTS - 2.5;
    const endDist = 2 * N_PRINTS + 2.5;
    const totalSpans = Math.ceil(endDist - startDist);

    const at = (d: number) =>
      new THREE.Vector3(
        ORIGIN_X + d * X_STEP + PEG_X_OFFSET,
        ORIGIN_Y + d * Y_STEP + PEG_Y_OFFSET + 0.05,
        ORIGIN_Z + d * Z_STEP
      );

    const steps = 14;
    for (let s = 0; s < totalSpans; s++) {
      const p1 = at(startDist + s);
      const p2 = at(startDist + s + 1);
      for (let j = s === 0 ? 0 : 1; j <= steps; j++) {
        const alpha = j / steps;
        const pt = new THREE.Vector3().lerpVectors(p1, p2, alpha);
        pt.y -= Math.sin(alpha * Math.PI) * sagFactor;
        points.push(pt);
      }
    }

    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 700, 0.0055, 8, false);
  }, [sagFactor]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = ((offsetRef.current % N_PRINTS) + N_PRINTS) % N_PRINTS;
    mesh.position.set(-m * X_STEP, -m * Y_STEP, -m * Z_STEP);
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color="#4E5258" metalness={0.7} roughness={0.35} />
    </mesh>
  );
};

// ── Camera parallax ─────────────────────────────────────────────────────────

const CameraController: React.FC = () => {
  const camera = useThree((s) => s.camera);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.current.x * 0.12, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.current.y * 0.08, 0.05);
  });

  return null;
};

// ── Gallery ─────────────────────────────────────────────────────────────────

export const HangingGallery3D: React.FC<HangingGallery3DProps> = ({
  onSelectArtwork,
  onIndexChange,
  breezeLevel,
  wireTension,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const targetOffset = useRef(0);
  const smoothOffset = useRef(0);
  const velocity = useRef(0);
  const lastMoveTime = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragActivated = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startOffset = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      targetOffset.current += delta * WHEEL_SENSITIVITY;
      // Opsional: Memberi sedikit inersia pada scroll mouse
      velocity.current += delta * WHEEL_SENSITIVITY * 0.1;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetOffset.current = Math.floor(targetOffset.current + 1);
        sound.playTick(480);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetOffset.current = Math.ceil(targetOffset.current - 1);
        sound.playTick(540);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    isDragging.current = true;
    dragActivated.current = false;
    velocity.current = 0; // Hentikan inersia saat layar disentuh
    lastMoveTime.current = performance.now();

    startX.current = e.clientX;
    startY.current = e.clientY;
    startOffset.current = targetOffset.current;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (!dragActivated.current) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      dragActivated.current = true;
      try {
        containerRef.current?.setPointerCapture(e.pointerId);
      } catch {}
    }

    const now = performance.now();
    const dt = Math.max(now - lastMoveTime.current, 1); // Cegah pembagian dengan 0
    lastMoveTime.current = now;

    const isHorizontal = Math.abs(dx) >= Math.abs(dy);
    
    // -dx : Kanan, dy : Bawah
    const delta = isHorizontal ? -dx : dy;
    const offsetDelta = delta * DRAG_SENSITIVITY;

    // ── HITUNG KECEPATAN (Velocity) ──
    // Konversi jarak dan waktu menjadi kecepatan per frame (asumsi 60fps)
    let instantVelocity = (offsetDelta / dt) * 16.66;
    
    // Batasi kecepatan maksimal agar tidak meluncur terlalu jauh
    instantVelocity = Math.max(-0.4, Math.min(0.4, instantVelocity));
    velocity.current = instantVelocity;

    targetOffset.current = startOffset.current + offsetDelta;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    dragActivated.current = false;

    // Jika pengguna berhenti sejenak sebelum melepas jari, hilangkan inersianya
    const now = performance.now();
    if (now - lastMoveTime.current > 80) {
      velocity.current = 0;
    }

    if (containerRef.current?.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const fov = typeof window !== 'undefined' && window.innerWidth < 640 ? 44 : 34;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[100dvh] overflow-hidden select-none bg-white touch-none ${
        hoveredIndex !== null ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
      }`}
      style={{ touchAction: 'none', overscrollBehavior: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <Canvas
        camera={{ position: [0, 0, 9.4], fov, near: 0.1, far: 60 }}
        dpr={[1, 2]}
        className="w-full h-full block"
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.domElement.style.touchAction = 'none';
        }}
      >
        <ambientLight intensity={1.9} />
        <directionalLight position={[6, 12, 10]} intensity={1.3} />
        <pointLight position={[-4, 2, 4]} intensity={0.4} color="#FFF8F0" />

        {/* Meneruskan velocity & isDragging ke dalam Canvas */}
        <ScrollRig
          targetOffset={targetOffset}
          smoothOffset={smoothOffset}
          velocity={velocity}
          isDragging={isDragging}
          onIndexChange={onIndexChange}
        />
        <CameraController />

        <Suspense fallback={null}>
          <ContinuousWire offsetRef={smoothOffset} tension={wireTension} />

          {ARTWORKS.map((artwork, i) => (
            <HangingPrint
              key={artwork.id}
              artwork={artwork}
              index={i}
              offsetRef={smoothOffset}
              breezeLevel={breezeLevel}
              onHover={setHoveredIndex}
              onSelect={onSelectArtwork}
              isHovered={hoveredIndex === i}
              isDraggingRef={isDragging}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* ── TEKS YANG SUDAH RESPONSIVE (Portrait & Landscape) ── */}
      <div className="absolute top-[110px] sm:top-[140px] md:top-[160px] left-6 sm:left-12 lg:left-16 z-20 pointer-events-none max-w-md select-none landscape:top-[80px] landscape:left-6">
        
        {/* Ukuran teks dikecilkan saat landscape */}
        <h1 className="font-condensed text-[52px] xs:text-[60px] sm:text-[80px] md:text-[100px] lg:text-[120px] landscape:text-[40px] leading-[0.85] tracking-tight text-ink-900">
          FOR U BABY
        </h1>
        
        {/* Garis pembatas */}
        <div className="w-8 sm:w-9 h-[1.5px] bg-neutral-300 my-4 sm:my-6 landscape:my-2" />
        
        {/* Lebar dan jarak diatur khusus untuk landscape */}
        <div className="space-y-4 max-w-[280px] sm:max-w-[360px] landscape:max-w-[240px] landscape:space-y-2">
          <p className="text-[#767676] text-[11px] sm:text-[13px] leading-relaxed font-sans landscape:text-[10px]">
            A collection of moments, little smiles, and memories that mean the world to me.
          </p>
          
          {/* Paragraf kedua disembunyikan di landscape agar tidak menutupi foto */}
          <p className="text-[#8A8A8A] text-[11px] sm:text-[12px] leading-relaxed font-sans italic border-l-2 border-neutral-300 pl-3 landscape:hidden">
            Each photograph holds a piece of our story, a reminder of the love we share and the moments I wish I could keep forever.
          </p>
        </div>
      </div>
    </div>
  );
};