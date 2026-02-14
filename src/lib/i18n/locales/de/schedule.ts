const schedule = {
  todaysSchedule: 'Heutiger Zeitplan',
  daySchedule: 'Zeitplan für {{day}}',
  weekLabel: 'Woche {{number}}',
  taskCount_one: '{{count}} Aufgabe',
  taskCount_other: '{{count}} Aufgaben',
  completed: 'Erledigt',
  openTask: 'Aufgabe öffnen',
  upNext: 'ALS NÄCHSTES',
  markComplete: 'Als erledigt markieren',
  endOfSchedule: 'Ende des Zeitplans für {{day}}',
  noTasksTitle: 'Keine Aufgaben geplant',
  noTasksSubtitle: 'Dein Zeitplan ist frei für {{day}}',
  comingSoon: 'Demnächst',
  scheduleCreating: 'Zeitplan-Erstellung wird implementiert...',
  previousWeek: 'Vorherige Woche',
  nextWeek: 'Nächste Woche',
  a11y: {
    jumpToTodayHint: 'Zum heutigen Tag springen',
    previousWeekHint: 'Zur vorherigen Woche navigieren',
    nextWeekHint: 'Zur nächsten Woche navigieren',
  },
  weekdays: {
    sun: 'So',
    mon: 'Mo',
    tue: 'Di',
    wed: 'Mi',
    thu: 'Do',
    fri: 'Fr',
    sat: 'Sa',
  },
} as const;

export default schedule;
