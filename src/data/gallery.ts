import { BABY_IMAGES } from './artworks';

export interface GalleryFrame {
  id: string;
  image: string;
  x: number;
  y: number;
  rotation: number;
  scale?: number;
  aspectRatio: string;
  year: string;
  title?: string;
  category?: string;
  location?: string;
}

export const GALLERY_FRAMES: GalleryFrame[] = [
  {
    id: 'g-01',
    image: BABY_IMAGES[0],
    x: 80,
    y: 60,
    rotation: -3.5,
    aspectRatio: '16/9',
    year: '2026'
  },
  {
    id: 'g-02',
    image: BABY_IMAGES[1],
    x: 340,
    y: 30,
    rotation: 2.2,
    aspectRatio: '4/3',
    year: '2026'
  },
  {
    id: 'g-03',
    image: BABY_IMAGES[2],
    x: 580,
    y: 10,
    rotation: -4.8,
    aspectRatio: '16/9',
    year: '2026'
  },
  {
    id: 'g-04',
    image: BABY_IMAGES[3],
    x: 840,
    y: 40,
    rotation: 3.1,
    aspectRatio: '4/3',
    year: '2026'
  },
  {
    id: 'g-05',
    image: BABY_IMAGES[4],
    x: 1080,
    y: 70,
    rotation: -2.0,
    aspectRatio: '16/9',
    year: '2026'
  },
  {
    id: 'g-06',
    image: BABY_IMAGES[5],
    x: 180,
    y: 280,
    rotation: 4.2,
    aspectRatio: '4/3',
    year: '2026'
  },
  {
    id: 'g-07',
    image: BABY_IMAGES[6],
    x: 440,
    y: 260,
    rotation: -1.8,
    aspectRatio: '16/9',
    year: '2026'
  },
  {
    id: 'g-08',
    image: BABY_IMAGES[7],
    x: 690,
    y: 290,
    rotation: 3.6,
    aspectRatio: '16/9',
    year: '2026'
  },
  {
    id: 'g-09',
    image: BABY_IMAGES[8],
    x: 900,
    y: 280,
    rotation: -2.8,
    aspectRatio: '4/3',
    year: '2026'
  },
  {
    id: 'g-10',
    image: BABY_IMAGES[9],
    x: 1160,
    y: 270,
    rotation: 1.5,
    aspectRatio: '16/9',
    year: '2026'
  },
  {
    id: 'g-11',
    image: BABY_IMAGES[0],
    x: 60,
    y: 530,
    rotation: -3.0,
    aspectRatio: '16/9',
    year: '2026'
  },
  {
    id: 'g-12',
    image: BABY_IMAGES[1],
    x: 320,
    y: 520,
    rotation: 2.7,
    aspectRatio: '4/3',
    year: '2026'
  },
  {
    id: 'g-13',
    image: BABY_IMAGES[2],
    x: 580,
    y: 540,
    rotation: -1.5,
    aspectRatio: '16/9',
    year: '2026'
  },
  {
    id: 'g-14',
    image: BABY_IMAGES[3],
    x: 820,
    y: 550,
    rotation: 4.1,
    aspectRatio: '16/9',
    year: '2026'
  },
  {
    id: 'g-15',
    image: BABY_IMAGES[4],
    x: 1040,
    y: 560,
    rotation: -2.3,
    aspectRatio: '4/3',
    year: '2026'
  },
  {
    id: 'g-16',
    image: BABY_IMAGES[5],
    x: 120,
    y: 800,
    rotation: 3.0,
    aspectRatio: '16/9',
    year: '2026'
  },
  {
    id: 'g-17',
    image: BABY_IMAGES[6],
    x: 370,
    y: 810,
    rotation: -4.0,
    aspectRatio: '4/3',
    year: '2026'
  },
  {
    id: 'g-18',
    image: BABY_IMAGES[7],
    x: 610,
    y: 790,
    rotation: 1.8,
    aspectRatio: '16/9',
    year: '2026'
  },
  {
    id: 'g-19',
    image: BABY_IMAGES[8],
    x: 870,
    y: 810,
    rotation: -2.5,
    aspectRatio: '4/3',
    year: '2026'
  },
  {
    id: 'g-20',
    image: BABY_IMAGES[9],
    x: 1100,
    y: 800,
    rotation: 3.5,
    aspectRatio: '16/9',
    year: '2026'
  }
];
