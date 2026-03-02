import { router, useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  ChevronDown,
  Droplets,
  FlaskConical,
  Leaf,
  Save,
  Scissors,
  Waypoints,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { useNotes } from '@/src/hooks/use-notes';
import { usePlants } from '@/src/hooks/use-plants';
import { Pressable, ScrollView, Text, TextInput, View } from '@/src/tw';

// ── Note categories ────────────────────────────────────────────────
const NOTE_CATEGORIES = [
  { key: 'general', icon: Leaf },
  { key: 'watering', icon: Droplets },
  { key: 'defoliation', icon: Scissors },
  { key: 'training', icon: Waypoints },
  { key: 'feeding', icon: FlaskConical },
] as const;

type CategoryKey = (typeof NOTE_CATEGORIES)[number]['key'];

// ── Helpers ────────────────────────────────────────────────────────
function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(iso: string, locale: string): string {
  const date = new Date(iso + 'T00:00:00');
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const formatted = date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
  if (isToday) return formatted;
  return formatted;
}

function toRouteParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

// ── Category pill ──────────────────────────────────────────────────
function CategoryPill({
  categoryKey,
  Icon,
  label,
  isSelected,
  onPress,
}: {
  categoryKey: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}): React.ReactElement {
  if (isSelected) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: true }}
        accessibilityLabel={label}
        accessibilityHint={label}
        className="flex-row items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 shadow-md active:scale-95 dark:bg-primary-bright"
        onPress={onPress}
        testID={`note-category-${categoryKey}`}
      >
        <Icon size={18} color="#ffffff" />
        <Text className="text-sm font-semibold text-white">{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: false }}
      accessibilityLabel={label}
      accessibilityHint={label}
      className="rounded-full border border-border bg-white px-5 py-2.5 active:scale-95 dark:border-dark-border dark:bg-dark-bg-elevated"
      onPress={onPress}
      testID={`note-category-${categoryKey}`}
    >
      <Text className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
        {label}
      </Text>
    </Pressable>
  );
}

// ── Main screen ────────────────────────────────────────────────────
export function AddNoteScreen(): React.ReactElement {
  const { t, i18n } = useTranslation('garden');
  const tCommon = useTranslation('common').t;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { plantId: plantIdParam } = useLocalSearchParams<{
    plantId?: string | string[];
  }>();
  const plantId = toRouteParam(plantIdParam);

  const { plants } = usePlants();
  const plant = useMemo(
    () => plants.find((p) => p.id === plantId) ?? null,
    [plants, plantId]
  );

  const { addNote } = useNotes(plantId);

  // ── Local state ──────────────────────────────────────────────────
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<CategoryKey>('general');
  const [date] = useState(() => toIsoDate(new Date()));
  const [isSaving, setIsSaving] = useState(false);

  const displayDate = useMemo(
    () => formatDisplayDate(date, i18n.language === 'de' ? 'de-DE' : 'en-US'),
    [date, i18n.language]
  );

  // ── Handlers ─────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  const handleSave = useCallback(async () => {
    if (!body.trim()) {
      Alert.alert(t('addNote.errorNoBody'));
      return;
    }
    if (!plantId) return;

    setIsSaving(true);
    try {
      await addNote({
        plantId,
        body: body.trim(),
        category,
        date,
      });
      router.back();
    } catch {
      Alert.alert(t('addNote.errorSave'));
    } finally {
      setIsSaving(false);
    }
  }, [body, plantId, category, date, addNote, t]);

  return (
    <View
      className="flex-1 bg-background px-6 pb-6 pt-8 dark:bg-dark-bg"
      collapsable={false}
    >
      <View collapsable={false}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('addNote.cancel')}
            accessibilityHint={t('addNote.cancel')}
            onPress={handleCancel}
            testID="note-cancel"
          >
            <Text className="text-base font-medium text-text-secondary dark:text-text-secondary-dark">
              {t('addNote.cancel')}
            </Text>
          </Pressable>

          <Text className="text-text dark:text-text-primary-dark text-xl font-bold">
            {t('addNote.title')}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={handleSave}
            disabled={isSaving}
            accessibilityLabel={t('addNote.save')}
            accessibilityHint={t('addNote.save')}
            testID="note-save-header"
          >
            <Text className="text-base font-bold text-primary dark:text-primary-bright">
              {t('addNote.save')}
            </Text>
          </Pressable>
        </View>

        {plant ? (
          <View className="mb-4 mt-4 items-center gap-1.5">
            <Text className="text-text dark:text-text-primary-dark text-2xl font-bold tracking-tight">
              {plant.name}
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-primary/10 px-3 py-1 dark:bg-primary-bright/10">
                <Text className="text-primary dark:text-primary-bright text-xs font-bold uppercase tracking-wide">
                  {plant.phase}
                </Text>
              </View>
              <Text className="text-text-secondary dark:text-text-secondary-dark text-sm font-medium">
                {t('plantDetail.dayCount', { day: plant.day })}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* ── Scrollable content ─────────────────────────────────── */}
      <ScrollView
        className="flex-1"
        collapsable={false}
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
      >
        <View>
          {/* Date picker button */}
          <View className="mb-6 gap-3">
            <View className="items-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={displayDate}
                accessibilityHint={displayDate}
                className="flex-row items-center gap-2 rounded-full border border-transparent bg-white px-4 py-2 shadow-sm active:opacity-80 dark:bg-dark-bg-elevated"
                testID="note-date-picker"
              >
                <Calendar
                  size={20}
                  color={isDark ? Colors.primaryBright : Colors.primary}
                />
                <Text className="text-sm font-semibold text-text dark:text-text-primary-dark">
                  {`${tCommon('today')}, ${displayDate}`}
                </Text>
                <ChevronDown
                  size={16}
                  color={
                    isDark ? Colors.textSecondaryDark : Colors.textSecondary
                  }
                />
              </Pressable>
            </View>

            {/* Category pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3"
            >
              {NOTE_CATEGORIES.map(({ key, icon: Icon }) => (
                <CategoryPill
                  key={key}
                  categoryKey={key}
                  Icon={Icon}
                  label={t(`addNote.categories.${key}`)}
                  isSelected={category === key}
                  onPress={() => setCategory(key)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Editor card */}
          <View className="relative mb-6 min-h-70 overflow-hidden rounded-2xl bg-white p-5 shadow-sm dark:bg-dark-bg-elevated">
            {/* Top accent bar (visible when focused) */}
            <View className="absolute left-0 right-0 top-0 h-1 bg-primary/40 dark:bg-primary-bright/40" />

            <TextInput
              accessibilityLabel={t('addNote.placeholder')}
              accessibilityHint={t('addNote.placeholder')}
              className="flex-1 bg-transparent p-1 text-lg leading-relaxed text-text dark:text-text-primary-dark"
              placeholder={t('addNote.placeholder')}
              placeholderTextColor={
                isDark ? Colors.textMutedDark : Colors.textMuted
              }
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
              testID="note-body-input"
              style={{ minHeight: 240 }}
            />
          </View>

          {/* Save button */}
          <View>
            <View className="overflow-hidden rounded-xl bg-primary shadow-lg dark:bg-primary-bright">
              <Pressable
                accessibilityRole="button"
                className="flex-row items-center justify-center gap-2 py-4 active:opacity-90"
                onPress={handleSave}
                disabled={isSaving}
                accessibilityLabel={t('addNote.saveNote')}
                accessibilityHint={t('addNote.saveNote')}
                testID="note-save-bottom"
              >
                <Save size={20} color="#ffffff" />
                <Text className="text-lg font-bold text-white">
                  {t('addNote.saveNote')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
