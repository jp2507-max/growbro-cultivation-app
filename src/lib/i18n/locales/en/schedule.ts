const schedule = {
  todaysSchedule: "Today's Schedule",
  daySchedule: "{{day}}'s Schedule",
  weekLabel: 'Week {{number}}',
  taskCount_one: '{{count}} Task',
  taskCount_other: '{{count}} Tasks',
  completed: 'Completed',
  upNext: 'UP NEXT',
  markComplete: 'Mark Complete',
  endOfSchedule: 'End of schedule for {{day}}',
  noTasksTitle: 'No Tasks Scheduled',
  noTasksSubtitle: 'Your schedule is clear for {{day}}',
  comingSoon: 'Coming soon',
  scheduleCreating: 'Creating schedule...',
  previousWeek: 'Previous week',
  nextWeek: 'Next week',
} as const;

export default schedule;
