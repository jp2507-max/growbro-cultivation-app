import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Stack from 'expo-router/stack';
import { ImagePlus, X } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { usePosts } from '@/src/hooks/use-posts';
import { type CreatePostFormData, createPostSchema } from '@/src/lib/forms';
import {
  sanitizePostCaption,
  sanitizePostHashtags,
} from '@/src/lib/text-sanitization';
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
  const { back } = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createPost } = usePosts();
  const textColor = isDark ? Colors.textPrimaryDark : Colors.text;

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    watch,
    formState: { errors },
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
        mediaTypes: ['images'],
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
          caption: sanitizePostCaption(data.caption),
          hashtags: sanitizePostHashtags(data.hashtags),
          imageUrl: selectedImage || undefined,
        });

        if (process.env.EXPO_OS !== 'web')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        back();
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
    [back, selectedImage, createPost, t]
  );

  return (
    <KeyboardAvoidingView
      className="bg-background dark:bg-dark-bg flex-1"
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: t('createPost.title'),
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('createPost.a11y.closeLabel')}
              accessibilityHint={t('createPost.a11y.closeHint')}
              onPress={back}
              className="p-1"
              testID="close-create-post"
            >
              <PlatformIcon
                sfName="xmark"
                fallbackIcon={X}
                size={22}
                color={isDark ? Colors.textPrimaryDark : Colors.text}
              />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              className="bg-primary dark:bg-primary-bright rounded-2xl px-4 py-1.5 active:opacity-80 disabled:opacity-40"
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
        }}
      />

      <ScrollView
        className="flex-1 px-5 pt-4"
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
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
              className="text-text dark:text-text-primary-dark min-h-30 text-base leading-6"
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
        {errors.caption && (
          <Text className="text-danger dark:text-error-dark mt-1 text-xs">
            {t(errors.caption.message ?? 'validation.required', {
              defaultValue: errors.caption.message ?? 'validation.required',
            })}
          </Text>
        )}

        <View className="border-border dark:border-dark-border mt-4 border-t pt-4">
          <Pressable
            accessibilityRole="button"
            className="bg-card dark:bg-dark-bg-card flex-row items-center gap-3 rounded-2xl p-4"
            onPress={handleImagePicker}
            testID="add-image-btn"
          >
            <PlatformIcon
              sfName="photo"
              fallbackIcon={ImagePlus}
              size={22}
              color={Colors.primary}
            />
            <Text className="text-text-secondary dark:text-text-secondary-dark text-[15px] font-medium">
              {t('createPost.addPhoto')}
            </Text>
          </Pressable>

          {selectedImage ? (
            <View className="relative mt-3">
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
                <PlatformIcon
                  sfName="xmark"
                  fallbackIcon={X}
                  size={16}
                  color="#fff"
                />
              </Pressable>
            </View>
          ) : null}
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
        {errors.hashtags && (
          <Text className="text-danger dark:text-error-dark mt-1 text-xs">
            {t(errors.hashtags.message ?? 'validation.required', {
              defaultValue: errors.hashtags.message ?? 'validation.required',
            })}
          </Text>
        )}

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
