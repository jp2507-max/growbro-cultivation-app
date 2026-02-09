export interface Strain {
  id: string;
  name: string;
  type: 'Indica' | 'Sativa' | 'Hybrid';
  thc: number;
  trait: string;
  imageUrl: string;
  origin?: string;
  effect?: string;
}

export const strains: Strain[] = [
  {
    id: '1',
    name: 'OG Kush',
    type: 'Indica',
    thc: 24,
    trait: 'High THC',
    imageUrl:
      'https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=300&h=300&fit=crop',
    origin: 'West Coast Origin',
    effect: 'Relaxing',
  },
  {
    id: '2',
    name: 'Super Lemon Haze',
    type: 'Sativa',
    thc: 19,
    trait: 'Energetic',
    imageUrl:
      'https://images.unsplash.com/photo-1518568403628-df55701ade9e?w=300&h=300&fit=crop',
    origin: 'Amsterdam',
    effect: 'Energizing',
  },
  {
    id: '3',
    name: 'GSC',
    type: 'Hybrid',
    thc: 22,
    trait: 'Balanced',
    imageUrl:
      'https://images.unsplash.com/photo-1587754878515-33842e38b823?w=300&h=300&fit=crop',
    origin: 'California',
    effect: 'Euphoric',
  },
  {
    id: '4',
    name: 'Blue Dream',
    type: 'Hybrid',
    thc: 21,
    trait: 'Popular',
    imageUrl:
      'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c4?w=300&h=300&fit=crop',
    origin: 'California',
    effect: 'Uplifting',
  },
  {
    id: '5',
    name: 'Sour Diesel',
    type: 'Sativa',
    thc: 20,
    trait: 'Pungent',
    imageUrl:
      'https://images.unsplash.com/photo-1601055903647-ddf1ee9701b7?w=300&h=300&fit=crop',
    origin: 'East Coast',
    effect: 'Energizing',
  },
  {
    id: '6',
    name: 'Northern Lights',
    type: 'Indica',
    thc: 18,
    trait: 'Classic',
    imageUrl:
      'https://images.unsplash.com/photo-1604591098897-1baa0e506b1f?w=300&h=300&fit=crop',
    origin: 'Pacific Northwest',
    effect: 'Relaxing',
  },
];

export const strainFilters = ['All', 'Sativa', 'Indica', 'Hybrid'] as const;
