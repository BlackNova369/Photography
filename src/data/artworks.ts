import baby1 from '../assets/baby/1e56f307-ff04-40c2-ba45-8418c6670143.jpeg';
import baby2 from '../assets/baby/21bc79c2-6f61-4258-825f-adabd2ae39f9.jpeg';
import baby3 from '../assets/baby/2320cf4c-9cbb-4731-ac7b-27e4819d426a.jpeg';
import baby4 from '../assets/baby/4DB88F1D-5FDD-4B29-96EF-8122246FFA2B.jpeg';
import baby5 from '../assets/baby/836ba9fd-2b6a-4b53-b9a6-ffdd29905111.jpeg';
import baby6 from '../assets/baby/9996128c-5b55-42cf-8990-feb4a388a7d0.jpeg';
import baby7 from '../assets/baby/a03f3949-20dd-42af-932a-274c9a33630e.jpeg';
import baby8 from '../assets/baby/afaf3bdd-28c3-45fd-8b53-7d2c48957baa.jpeg';
import baby9 from '../assets/baby/d79c9bf9-e40b-40e0-8b95-b9a358cd6c07.jpeg';
import baby10 from '../assets/baby/f1ec9d71-6a6c-44fb-a4b7-318ef2bf3e0f.jpeg';

export const BABY_IMAGES = [
  baby1,
  baby2,
  baby3,
  baby4,
  baby5,
  baby6,
  baby7,
  baby8,
  baby9,
  baby10,
];

export interface Artwork {
  id: string;
  number: string;
  title: string;
  series: string;
  place: string;
  country: string;
  year: string;
  camera: string;
  settings: string;
  description: string;
  edition: string;
  image: string;
  aspectRatio?: number;
  plates?: {
    caption: string;
    image: string;
    index: string;
  }[];
}

export const ARTWORKS: Artwork[] = [
  {
    id: 'ridge-walker',
    number: '01',
    title: 'Ridge Walker',
    series: 'SAND',
    place: 'ERG CHEBBI',
    country: 'MOROCCO',
    year: '2025',
    camera: 'HASSELBLAD X2D · 55MM',
    settings: 'F/8 · 1/500 · ISO 100',
    description: 'A single figure tracks the high ridge line of Erg Chebbi at late morning. Footprints wiped clean by midday winds.',
    edition: '1 OF 6 · PIGMENT ON COTTON',
    image: baby1,
    plates: [
      {
        caption: 'PLATE 01 — RIDGE WALKER · ERG CHEBBI',
        image: baby1,
        index: '01 / 03'
      },
      {
        caption: 'PLATE 02 — CREST DETAIL · ERG CHEBBI',
        image: baby2,
        index: '02 / 03'
      },
      {
        caption: 'PLATE 03 — AFTERNOON DRIFT · MERZOUGA',
        image: baby3,
        index: '03 / 03'
      }
    ]
  },
  {
    id: 'braided-water',
    number: '02',
    title: 'Braided Water',
    series: 'RIVERS',
    place: 'LANDMANNALAUGAR',
    country: 'ICELAND',
    year: '2024',
    camera: 'DJI MAVIC 3 PRO · 24MM',
    settings: 'F/4 · 1/800 · ISO 100',
    description: 'Glacial runoff carving hundreds of black and silt channels through the volcanic valley floor.',
    edition: '1 OF 8 · ARCHIVAL FIBER',
    image: baby2,
    plates: [
      {
        caption: 'PLATE 01 — CHANNELS · LANDMANNALAUGAR',
        image: baby2,
        index: '01 / 03'
      },
      {
        caption: 'PLATE 02 — VOLCANIC SILT · HIGHLANDS',
        image: baby3,
        index: '02 / 03'
      },
      {
        caption: 'PLATE 03 — ESTUARY MEETING · SKEIDARÁ',
        image: baby4,
        index: '03 / 03'
      }
    ]
  },
  {
    id: 'mirror-walk',
    number: '03',
    title: 'Mirror Walk',
    series: 'SALT',
    place: 'SALAR DE UYUNI',
    country: 'BOLIVIA',
    year: '2023',
    camera: 'SONY A7R V · 24-70MM',
    settings: 'F/7.1 · 1/400 · ISO 200',
    description: 'A shallow film of rainwater after the summer storm turns six thousand square miles into pure reflection.',
    edition: '1 OF 6 · PIGMENT ON RAG',
    image: baby3,
    plates: [
      {
        caption: 'PLATE 01 — INFINITE HORIZON · UYUNI',
        image: baby3,
        index: '01 / 02'
      },
      {
        caption: 'PLATE 02 — HEXAGON CRUST · PUKARA',
        image: baby4,
        index: '02 / 02'
      }
    ]
  },
  {
    id: 'first-light',
    number: '04',
    title: 'First Light',
    series: 'FIRE',
    place: 'REYKJANES',
    country: 'ICELAND',
    year: '2023',
    camera: 'SONY A7R V · 70-200MM',
    settings: 'F/5.6 · 1/250 · ISO 400',
    description: 'The fissure opened overnight. By dawn the lava had found the valley floor and the steam was lit from underneath.',
    edition: '1 OF 6 · PIGMENT ON COTTON',
    image: baby4,
    plates: [
      {
        caption: 'PLATE 01 — ACTIVE FISSURE · REYKJANES',
        image: baby4,
        index: '01 / 03'
      },
      {
        caption: 'PLATE 02 — BASALT FRONT · VALLEY RIDGE',
        image: baby5,
        index: '02 / 03'
      },
      {
        caption: 'PLATE 03 — SULFUR PLUME · CRATER',
        image: baby6,
        index: '03 / 03'
      }
    ]
  },
  {
    id: 'tall-grass-birds',
    number: '05',
    title: 'Tall Grass, Birds',
    series: 'FIGURES',
    place: 'ALENTEJO',
    country: 'PORTUGAL',
    year: '2025',
    camera: 'LEICA M11 · 35MM',
    settings: 'F/2.8 · 1/1000 · ISO 160',
    description: 'Flock taking flight over bleached golden grass at dusk in the dry interior plains.',
    edition: '1 OF 8 · GELATIN SILVER',
    image: baby5,
    plates: [
      {
        caption: 'PLATE 01 — MIGRATION · ALENTEJO',
        image: baby5,
        index: '01 / 02'
      },
      {
        caption: 'PLATE 02 — EVENING SHADOWS · ÉVORA',
        image: baby6,
        index: '02 / 02'
      }
    ]
  },
  {
    id: 'dead-pan',
    number: '06',
    title: 'Dead Pan',
    series: 'SAND',
    place: 'SOSSUSVLEI',
    country: 'NAMIBIA',
    year: '2024',
    camera: 'HASSELBLAD X2D · 90MM',
    settings: 'F/11 · 1/320 · ISO 64',
    description: 'Centuries-old camelthorn trees preserved by desert aridity against five-hundred-foot red sand dunes.',
    edition: '1 OF 5 · PLATINUM PALLADIUM',
    image: baby6,
    plates: [
      {
        caption: 'PLATE 01 — SILENT TRUNKS · DEADVLEI',
        image: baby6,
        index: '01 / 02'
      },
      {
        caption: 'PLATE 02 — RED RIDGE · BIG DADDY',
        image: baby7,
        index: '02 / 02'
      }
    ]
  },
  {
    id: 'causeway',
    number: '07',
    title: 'Causeway',
    series: 'RIVERS',
    place: 'WESTFJORDS',
    country: 'ICELAND',
    year: '2024',
    camera: 'DJI MAVIC 3 PRO · 70MM',
    settings: 'F/5.6 · 1/640 · ISO 100',
    description: 'A single ribbon of road slicing through sea spray and glacial estuarine mudflats.',
    edition: '1 OF 6 · ARCHIVAL FIBER',
    image: baby7,
    plates: [
      {
        caption: 'PLATE 01 — CROSSING · WESTFJORDS',
        image: baby7,
        index: '01 / 02'
      }
    ]
  },
  {
    id: 'salt-cones',
    number: '08',
    title: 'Salt Cones',
    series: 'SALT',
    place: 'TRAPANI',
    country: 'ITALY',
    year: '2022',
    camera: 'SONY A7R IV · 50MM',
    settings: 'F/8 · 1/1250 · ISO 100',
    description: 'Harvested sea salt mounded into pyramids to cure beneath the Sicilian Mediterranean sun.',
    edition: '1 OF 10 · PIGMENT ON RAG',
    image: baby8,
    plates: [
      {
        caption: 'PLATE 01 — PYRAMIDS · TRAPANI SALINE',
        image: baby8,
        index: '01 / 02'
      }
    ]
  },
  {
    id: 'black-shore',
    number: '09',
    title: 'Black Shore',
    series: 'WEATHER',
    place: 'VÍK',
    country: 'ICELAND',
    year: '2024',
    camera: 'SONY A7R V · 24-70MM',
    settings: 'F/6.3 · 1/200 · ISO 800',
    description: 'Incoming North Atlantic storm swell colliding with jet-black basalt sands.',
    edition: '1 OF 6 · PIGMENT ON COTTON',
    image: baby9,
    plates: [
      {
        caption: 'PLATE 01 — BASALT SWELL · REYNISFJARA',
        image: baby9,
        index: '01 / 02'
      }
    ]
  },
  {
    id: 'night-stand',
    number: '10',
    title: 'Night Stand',
    series: 'NIGHT',
    place: 'ATACAMA',
    country: 'CHILE',
    year: '2023',
    camera: 'SONY A7S III · 24MM',
    settings: 'F/1.8 · 15S · ISO 3200',
    description: 'The galactic core rising above 5,000 meters in the driest non-polar desert on Earth.',
    edition: '1 OF 5 · CHROMA LUXE',
    image: baby10,
    plates: [
      {
        caption: 'PLATE 01 — ZENITH ARC · VALLE DE LA LUNA',
        image: baby10,
        index: '01 / 02'
      }
    ]
  },
  {
    id: 'crescent',
    number: '11',
    title: 'Crescent',
    series: 'COAST',
    place: 'ALGARVE',
    country: 'PORTUGAL',
    year: '2025',
    camera: 'DJI MAVIC 3 PRO · 24MM',
    settings: 'F/4 · 1/1000 · ISO 100',
    description: 'Turquoise Atlantic swells breaking against golden sandstone arches and hidden coves.',
    edition: '1 OF 8 · PIGMENT ON COTTON',
    image: baby1,
    plates: [
      {
        caption: 'PLATE 01 — SANDSTONE COVE · BENAGIL',
        image: baby1,
        index: '01 / 02'
      }
    ]
  }
];
