import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Thermometer, Droplets, FlaskConical, CheckCircle, Circle, ListTodo, Plus } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { plantData, todayTasks, Task } from '@/mocks/garden';

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      {icon}
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onToggle(task.id);
  }, [task.id, onToggle, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[styles.taskRow, task.completed && styles.taskRowCompleted]}
        onPress={() => {
          handlePress();
          router.push({ pathname: '/task-detail', params: { title: task.title } });
        }}
        testID={`task-${task.id}`}
      >
        <View style={styles.taskLeft}>
          {task.completed ? (
            <CheckCircle size={26} color={Colors.primary} />
          ) : (
            <Circle size={26} color={Colors.textMuted} />
          )}
          <View style={styles.taskText}>
            <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
              {task.title}
            </Text>
            <Text style={styles.taskSubtitle}>{task.subtitle}</Text>
          </View>
        </View>
        {task.dueTime && !task.completed && (
          <View style={styles.dueBadge}>
            <Text style={styles.dueText}>{task.dueTime}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function GardenScreen() {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<Task[]>(todayTasks);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const pendingCount = tasks.filter((t) => !t.completed).length;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.tentLabel}>{plantData.tent}</Text>
          <Text style={styles.plantName}>{plantData.name}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.addPlantBtn} onPress={() => router.push('/add-plant')} testID="add-plant-btn">
            <Plus size={20} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/profile')} testID="profile-btn">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop' }}
            style={styles.headerAvatar}
          />
        </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          <View style={styles.plantImageWrapper}>
            <View style={styles.progressRing}>
              <Image
                source={{ uri: plantData.imageUrl }}
                style={styles.plantImage}
                contentFit="cover"
              />
            </View>
          </View>
          <View style={styles.readyBadge}>
            <Text style={styles.readyText}>{plantData.readyPercent}% Ready</Text>
          </View>
          <Text style={styles.dayText}>Day {plantData.day}</Text>
          <Text style={styles.phaseText}>
            {plantData.phase} • {plantData.weeksLeft} weeks left
          </Text>

          <View style={styles.metricsRow}>
            <MetricCard
              icon={<Thermometer size={18} color="#FF7043" />}
              label="TEMP"
              value={plantData.temp}
            />
            <MetricCard
              icon={<Droplets size={18} color={Colors.primaryLight} />}
              label="HUMIDITY"
              value={plantData.humidity}
            />
            <MetricCard
              icon={<FlaskConical size={18} color="#AB47BC" />}
              label="PH"
              value={plantData.ph}
            />
          </View>
        </View>

        <View style={styles.taskHeader}>
          <Text style={styles.taskSectionTitle}>{"Today's Tasks"}</Text>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>{pendingCount} Pending</Text>
          </View>
        </View>

        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={toggleTask} />
        ))}

        <TouchableOpacity style={styles.logButton} activeOpacity={0.8} testID="log-activity-btn">
          <ListTodo size={20} color={Colors.white} />
          <Text style={styles.logButtonText}>Log Activity</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tentLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  plantName: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addPlantBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  plantImageWrapper: {
    marginBottom: 12,
  },
  progressRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: Colors.primary,
    padding: 6,
    backgroundColor: Colors.border,
  },
  plantImage: {
    width: '100%',
    height: '100%',
    borderRadius: 84,
  },
  readyBadge: {
    backgroundColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  readyText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  dayText: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  phaseText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  taskSectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  pendingBadge: {
    backgroundColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  taskRow: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  taskRowCompleted: {
    opacity: 0.6,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  taskText: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  taskSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dueBadge: {
    backgroundColor: Colors.redLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dueText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.red,
  },
  logButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
