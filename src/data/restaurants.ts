export type CategoryType = 'spot-curated' | 'bib-gourmand' | 'critics-choice';

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  neighborhood: string;
  fee: number;
  color: string;
  categories: CategoryType[];
  michelinStars?: 1 | 2 | 3;  // Only set if restaurant has stars
  rating: number;              // e.g., 4.8 (scale 0-5)
  isNew?: boolean;             // Recently added to the list
}

export interface Category {
  id: CategoryType;
  name: string;
  description: string;
  color: string;
}

export const categories: Category[] = [
  {
    id: 'spot-curated',
    name: 'Spot Curated',
    description: 'An award from the MICHELIN Guide.',
    color: '#8B4513', // warm brown
  },
  {
    id: 'bib-gourmand',
    name: 'Bib Gourmand',
    description: 'Exceptional food at moderate prices.',
    color: '#B22222', // firebrick red
  },
  {
    id: 'critics-choice',
    name: "Critic's Choice",
    description: 'Highly rated by top food critics.',
    color: '#2F4F4F', // dark slate
  },
];

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Santa Pablo',
    cuisine: 'New Mexican',
    neighborhood: 'LES',
    fee: 25,
    color: '#7C5E3C',
    categories: ['spot-curated'],
    rating: 4.6,
  },
  {
    id: '2',
    name: 'Lilia',
    cuisine: 'Italian',
    neighborhood: 'Williamsburg',
    fee: 50,
    color: '#4A6741',
    categories: ['spot-curated', 'critics-choice'],
    michelinStars: 1,
    rating: 4.8,
    isNew: true,
  },
  {
    id: '3',
    name: 'Kochi',
    cuisine: 'Korean',
    neighborhood: 'Midtown',
    fee: 25,
    color: '#8B7355',
    categories: ['bib-gourmand'],
    michelinStars: 1,
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Via Carota',
    cuisine: 'Italian',
    neighborhood: 'West Village',
    fee: 25,
    color: '#6B8E6B',
    categories: ['spot-curated', 'bib-gourmand'],
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
    categories: ['bib-gourmand', 'critics-choice'],
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
    categories: ['critics-choice'],
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
    categories: ['spot-curated'],
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
    categories: ['bib-gourmand'],
    michelinStars: 1,
    rating: 4.6,
  },
  {
    id: '9',
    name: 'Laser Wolf',
    cuisine: 'Israeli',
    neighborhood: 'Williamsburg',
    fee: 25,
    color: '#556B2F',
    categories: ['critics-choice'],
    rating: 4.4,
  },
  {
    id: '10',
    name: 'Ci Siamo',
    cuisine: 'Italian',
    neighborhood: 'Hudson Yards',
    fee: 50,
    color: '#704214',
    categories: ['spot-curated', 'critics-choice'],
    michelinStars: 1,
    rating: 4.7,
  },
];
