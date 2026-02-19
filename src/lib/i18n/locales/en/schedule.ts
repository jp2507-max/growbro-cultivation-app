const schedule = {
  todaysSchedule: "Today's Schedule",
  daySchedule: "{{day}}'s Schedule",
  weekLabel: 'Week {{number}}',
  taskCount_one: '{{count}} Task',
  taskCount_other: '{{count}} Tasks',
  completed: 'Completed',
  openTask: 'Open task',
  upNext: 'UP NEXT',
  markComplete: 'Mark Complete',
  endOfSchedule: 'End of schedule for {{day}}',
  noTasksTitle: 'No Tasks Scheduled',
  noTasksSubtitle: 'Your schedule is clear for {{day}}',
  comingSoon: 'Coming soon',
  scheduleCreating: 'Creating schedule...',
  previousWeek: 'Previous week',
  nextWeek: 'Next week',
  a11y: {
    jumpToTodayHint: 'Jump to today',
    previousWeekHint: 'Navigate to the previous week',
    nextWeekHint: 'Navigate to the next week',
  },
  weekdays: {
    sun: 'Sun',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
  },
} as const;

export default schedule;
