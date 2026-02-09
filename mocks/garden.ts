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

export const plantData: PlantData = {
  name: 'Blue Dream',
  tent: 'TENT A',
  day: 42,
  phase: 'Vegetative Phase',
  weeksLeft: 6,
  readyPercent: 85,
  temp: '78°F',
  humidity: '45%',
  ph: '6.2',
  imageUrl:
    'https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=400&h=400&fit=crop',
};

export const todayTasks: Task[] = [
  {
    id: '1',
    title: 'Water Plant',
    subtitle: 'Nutrient Mix A • 2.5L',
    dueTime: 'Due 9:00 AM',
    completed: false,
  },
  {
    id: '2',
    title: 'Low Stress Training',
    subtitle: 'Adjust tie-downs',
    completed: false,
  },
  {
    id: '3',
    title: 'Check pH Levels',
    subtitle: 'Target 6.0-6.5',
    completed: true,
  },
];
