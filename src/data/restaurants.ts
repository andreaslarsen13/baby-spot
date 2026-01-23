export type CategoryType =
  | 'spots-picks'
  | 'infatuation-25'
  | 'infatuation-hit-list'
  | 'hot-tables'
  | 'spot-after-dark'
  | 'eater-top-picks'
  | 'pete-wells-24'
  | 'nyt-picks-25'
  | 'michelin-stars';

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  neighborhood: string;
  fee: number;
  color: string;
  image?: string;              // Card image URL
  categories: CategoryType[];
  michelinStars?: 1 | 2 | 3;  // Only set if restaurant has stars
  rating: number;              // e.g., 4.8 (scale 0-5)
  isNew?: boolean;             // Recently added to the list
}

export interface Category {
  id: CategoryType;
  title: string;        // Short title for pills
  subtitle: string;     // Descriptive subtitle
  image?: string;       // Background image URL (to be added)
  color: string;        // Background color for banner
}

export const categories: Category[] = [
  {
    id: 'spots-picks',
    title: "Spot's Picks",
    subtitle: "What we're recommending this month",
    color: '#8B4513',
  },
  {
    id: 'infatuation-25',
    title: "Infatuation '25",
    subtitle: "The Infatuation's best new restaurants of 2025",
    color: '#1a1a2e',
  },
  {
    id: 'infatuation-hit-list',
    title: 'Infatuation Hit List',
    subtitle: "The Infatuation's best new restaurants, updated monthly",
    color: '#2d2d44',
  },
  {
    id: 'hot-tables',
    title: 'Hot Tables',
    subtitle: 'Most booked on Spot this month',
    color: '#B22222',
  },
  {
    id: 'spot-after-dark',
    title: 'Spot After Dark',
    subtitle: 'Where to grab a drink after dinner',
    color: '#2F4F4F',
  },
  {
    id: 'eater-top-picks',
    title: 'Eater Top Picks',
    subtitle: "Eater NY's highest-rated restaurants, updated monthly",
    color: '#8B0000',
  },
  {
    id: 'pete-wells-24',
    title: "Pete Wells '24",
    subtitle: "Pete Wells' best restaurants of 2024",
    color: '#1c1c1c',
  },
  {
    id: 'nyt-picks-25',
    title: "NYT Picks '25",
    subtitle: "The New York Times' best restaurants of 2025",
    color: '#0d0d0d',
  },
  {
    id: 'michelin-stars',
    title: 'Michelin Guide',
    subtitle: 'Restaurants awarded Michelin stars',
    color: '#8B0000',
  },
];

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Misi',
    cuisine: 'Italian',
    neighborhood: 'Williamsburg',
    fee: 25,
    color: '#E8A0A0',
    image: '/cards/misi.png',
    categories: ['spots-picks', 'infatuation-hit-list', 'hot-tables'],
    rating: 4.7,
  },
  {
    id: '2',
    name: 'Winson',
    cuisine: 'Chinese',
    neighborhood: 'Chinatown',
    fee: 25,
    color: '#3366CC',
    image: '/cards/winson.png',
    categories: ['spots-picks', 'infatuation-25', 'hot-tables'],
    rating: 4.6,
    isNew: true,
  },
  {
    id: '3',
    name: 'Caffè Panna',
    cuisine: 'Italian',
    neighborhood: 'East Village',
    fee: 25,
    color: '#5A9A6B',
    image: '/cards/caffe.png',
    categories: ['hot-tables', 'spot-after-dark'],
    rating: 4.8,
  },
  {
    id: '4',
    name: "Bodega's Hall",
    cuisine: 'Mexican',
    neighborhood: 'Bushwick',
    fee: 25,
    color: '#CC3333',
    image: '/cards/bodegas-hall.png',
    categories: ['spots-picks', 'eater-top-picks', 'hot-tables'],
    rating: 4.5,
    isNew: true,
  },
  {
    id: '5',
    name: 'Dhamaka',
    cuisine: 'Indian',
    neighborhood: 'LES',
    fee: 25,
    color: '#CD853F',
    categories: ['infatuation-25', 'pete-wells-24', 'nyt-picks-25'],
    rating: 4.7,
    isNew: true,
  },
  {
    id: '6',
    name: 'Tatiana',
    cuisine: 'Caribbean',
    neighborhood: 'Lincoln Center',
    fee: 50,
    color: '#5F9EA0',
    categories: ['pete-wells-24', 'nyt-picks-25', 'michelin-stars'],
    michelinStars: 1,
    rating: 4.6,
  },
  {
    id: '7',
    name: 'Atomix',
    cuisine: 'Korean',
    neighborhood: 'Nomad',
    fee: 100,
    color: '#483D8B',
    categories: ['spots-picks', 'michelin-stars', 'nyt-picks-25'],
    michelinStars: 2,
    rating: 4.9,
  },
  {
    id: '8',
    name: 'Don Angie',
    cuisine: 'Italian-American',
    neighborhood: 'West Village',
    fee: 25,
    color: '#8B4513',
    categories: ['hot-tables', 'eater-top-picks', 'michelin-stars'],
    michelinStars: 1,
    rating: 4.6,
  },
  {
    id: '9',
    name: 'Attaboy',
    cuisine: 'Cocktail Bar',
    neighborhood: 'LES',
    fee: 25,
    color: '#556B2F',
    categories: ['spot-after-dark'],
    rating: 4.4,
  },
  {
    id: '10',
    name: 'Ci Siamo',
    cuisine: 'Italian',
    neighborhood: 'Hudson Yards',
    fee: 50,
    color: '#704214',
    categories: ['spots-picks', 'infatuation-hit-list', 'michelin-stars'],
    michelinStars: 1,
    rating: 4.7,
  },
];
