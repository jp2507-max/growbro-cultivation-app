import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Stack from 'expo-router/stack';
import { ImagePlus, X } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  TextInput,
  useColorScheme,
} from 'react-native';

import Colors from '@/constants/colors';
import { usePosts } from '@/src/hooks/use-posts';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  View,
} from '@/src/tw';

export default function CreatePostScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createPost } = usePosts();

  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = caption.trim().length > 0 && !isSubmitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    if (process.env.EXPO_OS !== 'web')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await createPost({
        caption: caption.trim(),
        hashtags: hashtags.trim() || undefined,
      });
      router.back();
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, caption, hashtags, createPost]);

  return (
    <KeyboardAvoidingView
      className="bg-background dark:bg-dark-bg flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'New Post',
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              className="p-1"
              testID="close-create-post"
            >
              <X
                size={22}
                color={isDark ? Colors.textPrimaryDark : Colors.text}
              />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              className="bg-primary dark:bg-primary-bright rounded-[16px] px-4 py-1.5 active:opacity-80 disabled:opacity-40"
              onPress={handleSubmit}
              disabled={!canSubmit}
              testID="submit-post-btn"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="dark:text-dark-bg text-sm font-bold text-white">
                  Share
                </Text>
              )}
            </Pressable>
          ),
          presentation: 'modal',
        }}
      />

      <ScrollView
        className="flex-1 px-5 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          accessibilityRole="text"
          placeholder="What's growing on?"
          placeholderTextColor={
            isDark ? Colors.textMutedDark : Colors.textMuted
          }
          value={caption}
          onChangeText={setCaption}
          multiline
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: isDark ? Colors.textPrimaryDark : Colors.text,
            minHeight: 120,
            textAlignVertical: 'top',
          }}
          testID="caption-input"
          autoFocus
        />

        <View className="border-border dark:border-dark-border mt-4 border-t pt-4">
          <Pressable
            accessibilityRole="button"
            className="bg-card dark:bg-dark-bg-card flex-row items-center gap-3 rounded-2xl p-4"
            testID="add-image-btn"
          >
            <ImagePlus size={22} color={Colors.primary} />
            <Text className="text-textSecondary dark:text-text-secondary-dark text-[15px] font-medium">
              Add Photo
            </Text>
          </Pressable>
        </View>

        <View className="mt-4">
          <TextInput
            accessibilityRole="text"
            placeholder="#hashtags"
            placeholderTextColor={
              isDark ? Colors.textMutedDark : Colors.textMuted
            }
            value={hashtags}
            onChangeText={setHashtags}
            style={{
              fontSize: 14,
              color: isDark ? Colors.primaryBright : Colors.primary,
            }}
            testID="hashtags-input"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
