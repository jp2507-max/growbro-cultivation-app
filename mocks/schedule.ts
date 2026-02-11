export interface ScheduleTask {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'current' | 'upcoming';
  icon: 'sun' | 'droplets' | 'flask' | 'moon';
}

export const scheduleTasks: (ScheduleTask & {
  completed: boolean;
  createdAt: number;
})[] = [
  {
    id: '00000000-0000-4000-a000-000000000021',
    time: '08:00 AM',
    title: 'Lights On',
    subtitle: 'Cycle: 18/6 Veg',
    status: 'completed',
    icon: 'sun',
    completed: true,
    createdAt: Date.now(),
  },
  {
    id: '00000000-0000-4000-a000-000000000022',
    time: '09:30 AM',
    title: 'Watering',
    subtitle: '2 Gallons - pH 6.2',
    status: 'completed',
    icon: 'droplets',
    completed: true,
    createdAt: Date.now(),
  },
  {
    id: '00000000-0000-4000-a000-000000000023',
    time: '02:00 PM',
    title: 'Add Nutrients - CalMag',
    subtitle: 'Mix 5ml per gallon. Check EC levels before feeding.',
    status: 'current',
    icon: 'flask',
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: '00000000-0000-4000-a000-000000000024',
    time: '08:00 PM',
    title: 'Lights Off',
    subtitle: 'Night Cycle Begins',
    status: 'upcoming',
    icon: 'moon',
    completed: false,
    createdAt: Date.now(),
  },
];

export const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const weekDates = [1, 2, 3, 4, 5, 6, 7];
