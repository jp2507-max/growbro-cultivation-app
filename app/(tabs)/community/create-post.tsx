import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import Stack from 'expo-router/stack';
import { ImagePlus, X } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { usePosts } from '@/src/hooks/use-posts';
import { type CreatePostFormData, createPostSchema } from '@/src/lib/forms';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from '@/src/tw';
import { Image } from '@/src/tw/image';

export default function CreatePostScreen() {
  const { t } = useTranslation('community');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createPost } = usePosts();
  const textColor = isDark ? Colors.textPrimaryDark : Colors.text;

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    watch,
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { caption: '', hashtags: '' },
    mode: 'onBlur',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const captionValue = watch('caption');
  const canSubmit = captionValue.trim().length > 0 && !isSubmitting;

  const handleImagePicker = useCallback(async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setServerError(t('createPost.errors.mediaPermission'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setServerError('');
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setServerError(t('createPost.errors.failedPickImage'));
    }
  }, [t]);

  const onValidSubmit = useCallback(
    async (data: CreatePostFormData) => {
      setIsSubmitting(true);
      setServerError('');

      try {
        await createPost({
          caption: data.caption.trim(),
          hashtags: data.hashtags?.trim() || undefined,
          imageUrl: selectedImage || undefined,
        });

        if (process.env.EXPO_OS !== 'web')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        router.back();
      } catch (err) {
        setServerError(
          err instanceof Error
            ? err.message
            : t('createPost.errors.failedCreatePost')
        );
        console.error('Failed to create post:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedImage, createPost, t]
  );

  return (
    <KeyboardAvoidingView
      className="bg-background dark:bg-dark-bg flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: t('createPost.title'),
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
              onPress={rhfHandleSubmit(onValidSubmit)}
              disabled={!canSubmit}
              testID="submit-post-btn"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="dark:text-dark-bg text-sm font-bold text-white">
                  {t('createPost.share')}
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
        <Controller
          name="caption"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              accessibilityRole="text"
              placeholder={t('createPost.captionPlaceholder')}
              placeholderTextColor={
                isDark ? Colors.textMutedDark : Colors.textMuted
              }
              className="text-text dark:text-text-primary-dark min-h-[120px] text-base leading-6"
              style={{ color: textColor }}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              textAlignVertical="top"
              testID="caption-input"
              autoFocus
            />
          )}
        />

        <View className="border-border dark:border-dark-border mt-4 border-t pt-4">
          <Pressable
            accessibilityRole="button"
            className="bg-card dark:bg-dark-bg-card flex-row items-center gap-3 rounded-2xl p-4"
            onPress={handleImagePicker}
            testID="add-image-btn"
          >
            <ImagePlus size={22} color={Colors.primary} />
            <Text className="text-textSecondary dark:text-text-secondary-dark text-[15px] font-medium">
              {t('createPost.addPhoto')}
            </Text>
          </Pressable>

          {selectedImage && (
            <View className="mt-3 relative">
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-48 rounded-xl"
                contentFit="cover"
              />
              <Pressable
                accessibilityRole="button"
                className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
                onPress={() => setSelectedImage(null)}
                testID="remove-image-btn"
              >
                <X size={16} color="#fff" />
              </Pressable>
            </View>
          )}
        </View>

        <View className="mt-4">
          <Controller
            name="hashtags"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                accessibilityRole="text"
                placeholder={t('createPost.hashtagsPlaceholder')}
                placeholderTextColor={
                  isDark ? Colors.textMutedDark : Colors.textMuted
                }
                className="text-primary dark:text-primary-bright text-sm"
                style={{
                  color: isDark ? Colors.primaryBright : Colors.primary,
                }}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                testID="hashtags-input"
              />
            )}
          />
        </View>

        {serverError ? (
          <Text
            className="text-danger dark:text-error-dark mt-4 text-sm font-semibold"
            selectable
          >
            {serverError}
          </Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
