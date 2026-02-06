import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sun,
  Droplets,
  FlaskConical,
  Moon,
  CheckCircle,
  Clock,
  Plus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import Colors from '@/constants/colors';
import { scheduleTasks, ScheduleTask, weekDays, weekDates } from '@/mocks/schedule';

const iconMap = {
  sun: Sun,
  droplets: Droplets,
  flask: FlaskConical,
  moon: Moon,
};

function StatusIndicator({ status }: { status: ScheduleTask['status'] }) {
  if (status === 'completed') return <CheckCircle size={28} color={Colors.primary} fill={Colors.primary} />;
  if (status === 'current') return (
    <View style={styles.currentDot}>
      <View style={styles.currentDotInner} />
    </View>
  );
  return <Clock size={24} color={Colors.textMuted} />;
}

function ScheduleCard({ task, onComplete }: { task: ScheduleTask; onComplete: (id: string) => void }) {
  const IconComponent = iconMap[task.icon];
  const isCurrent = task.status === 'current';
  const isCompleted = task.status === 'completed';

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <StatusIndicator status={task.status} />
        {task.id !== '4' && <View style={[styles.timelineLine, isCurrent && styles.timelineLineActive]} />}
      </View>
      <View style={[styles.scheduleCard, isCurrent && styles.scheduleCardActive]}>
        <View style={styles.cardHeader}>
          <View style={styles.timeRow}>
            <View style={[styles.timeBadge, isCurrent && styles.timeBadgeActive]}>
              <Text style={[styles.timeText, isCurrent && styles.timeTextActive]}>{task.time}</Text>
            </View>
            {isCompleted && <Text style={styles.completedLabel}>Completed</Text>}
            {isCurrent && <Text style={styles.upNextLabel}>UP NEXT</Text>}
          </View>
          <IconComponent size={20} color={isCompleted ? Colors.textMuted : Colors.primary} />
        </View>
        <TouchableOpacity onPress={() => router.push({ pathname: '/task-detail', params: { title: task.title } })}>
          <Text style={[styles.cardTitle, isCompleted && styles.cardTitleCompleted]}>{task.title}</Text>
        </TouchableOpacity>
        <Text style={[styles.cardSubtitle, isCompleted && styles.cardSubtitleCompleted]}>{task.subtitle}</Text>
        {isCurrent && (
          <TouchableOpacity
            style={styles.markCompleteBtn}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onComplete(task.id);
            }}
            testID={`complete-${task.id}`}
          >
            <Text style={styles.markCompleteText}>Mark Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState(4);
  const [tasks, setTasks] = useState<ScheduleTask[]>(scheduleTasks);

  const handleComplete = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'completed' as const } : t)));
  }, []);

  const taskCount = tasks.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <CalendarDays size={22} color={Colors.primary} />
        <Text style={styles.headerTitle}>October 2023</Text>
        <TouchableOpacity style={styles.todayBtn}>
          <Text style={styles.todayBtnText}>Today</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekNav}>
        <TouchableOpacity><ChevronLeft size={20} color={Colors.textSecondary} /></TouchableOpacity>
        <Text style={styles.weekLabel}>Week 4</Text>
        <TouchableOpacity><ChevronRight size={20} color={Colors.textSecondary} /></TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {weekDays.map((day, i) => (
          <Pressable
            key={`${day}-${i}`}
            style={styles.dayCol}
            onPress={() => setSelectedDay(i)}
          >
            <Text style={styles.dayLabel}>{day}</Text>
            <View style={[styles.dateCircle, selectedDay === i && styles.dateCircleActive]}>
              <Text style={[styles.dateText, selectedDay === i && styles.dateTextActive]}>
                {weekDates[i]}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.divider} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleTitle}>{"Today's Schedule"}</Text>
          <Text style={styles.taskCount}>{taskCount} Tasks</Text>
        </View>

        {tasks.map((task) => (
          <ScheduleCard key={task.id} task={task} onComplete={handleComplete} />
        ))}

        <Text style={styles.endText}>End of schedule for today</Text>
        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { bottom: 24 }]} testID="add-schedule-btn">
        <Plus size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  todayBtn: {
    backgroundColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  todayBtnText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  weekLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  dateCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleActive: {
    backgroundColor: Colors.primary,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  dateTextActive: {
    color: Colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginTop: 16,
    marginHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 24,
  },
  scheduleTitle: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  taskCount: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 32,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.borderLight,
    marginTop: 4,
  },
  timelineLineActive: {
    backgroundColor: Colors.primary,
  },
  scheduleCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  scheduleCardActive: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeBadgeActive: {
    backgroundColor: Colors.primary,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  timeTextActive: {
    color: Colors.white,
  },
  completedLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  upNextLabel: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  cardTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  cardSubtitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  markCompleteBtn: {
    borderWidth: 1.5,
    borderColor: Colors.textSecondary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  markCompleteText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  endText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  currentDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
