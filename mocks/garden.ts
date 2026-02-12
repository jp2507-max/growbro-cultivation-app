export interface Task {
  id: string;
  title: string;
  subtitle: string;
  dueTime?: string;
  completed: boolean;
}

export interface PlantData {
  name: string;
  tent: string;
  day: number;
  phase: string;
  weeksLeft: number;
  readyPercent: number;
  temp: string;
  humidity: string;
  ph: string;
  imageUrl: string;
}

export const plantData: PlantData & {
  id: string;
  strainType: string;
  environment: string;
  createdAt: number;
} = {
  id: '00000000-0000-4000-a000-000000000001',
  name: 'Blue Dream',
  tent: 'TENT A',
  strainType: 'Hybrid',
  environment: 'Indoor',
  day: 42,
  phase: 'Vegetative Phase',
  weeksLeft: 6,
  readyPercent: 85,
  temp: '78°F',
  humidity: '45%',
  ph: '6.2',
  imageUrl:
    'https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=400&h=400&fit=crop',
  createdAt: Date.now(),
};

export const todayTasks: (Task & {
  time?: string;
  status?: string;
  icon?: string;
  date?: string;
  createdAt: number;
})[] = [
  {
    id: '00000000-0000-4000-a000-000000000011',
    title: 'Water Plant',
    subtitle: 'Nutrient Mix A • 2.5L',
    dueTime: 'Due 9:00 AM',
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: '00000000-0000-4000-a000-000000000012',
    title: 'Low Stress Training',
    subtitle: 'Adjust tie-downs',
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: '00000000-0000-4000-a000-000000000013',
    title: 'Check pH Levels',
    subtitle: 'Target 6.0-6.5',
    completed: true,
    createdAt: Date.now(),
  },
];
