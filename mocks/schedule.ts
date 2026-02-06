export interface ScheduleTask {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'current' | 'upcoming';
  icon: 'sun' | 'droplets' | 'flask' | 'moon';
}

export const scheduleTasks: ScheduleTask[] = [
  { id: '1', time: '08:00 AM', title: 'Lights On', subtitle: 'Cycle: 18/6 Veg', status: 'completed', icon: 'sun' },
  { id: '2', time: '09:30 AM', title: 'Watering', subtitle: '2 Gallons - pH 6.2', status: 'completed', icon: 'droplets' },
  { id: '3', time: '02:00 PM', title: 'Add Nutrients - CalMag', subtitle: 'Mix 5ml per gallon. Check EC levels before feeding.', status: 'current', icon: 'flask' },
  { id: '4', time: '08:00 PM', title: 'Lights Off', subtitle: 'Night Cycle Begins', status: 'upcoming', icon: 'moon' },
];

export const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const weekDates = [1, 2, 3, 4, 5, 6, 7];
