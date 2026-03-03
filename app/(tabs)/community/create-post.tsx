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
import { HeaderAction } from '@/src/components/ui/header-action';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { SelectionCard } from '@/src/components/ui/selection-card';
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
  const { back } = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createPost } = usePosts();

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      type: 'showcase',
      imageUrl: '',
      caption: '',
      hashtags: '',
    },
    mode: 'onBlur',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const selectedType = watch('type');
  const captionValue = watch('caption');
  const canSubmit =
    captionValue.trim().length > 0 &&
    !!selectedType &&
    !!selectedImage &&
    !isSubmitting;

  const captionPlaceholder =
    selectedType === 'help'
      ? t('createPost.helpCaptionPlaceholder')
      : t('createPost.captionPlaceholder');

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
        const nextImageUri = result.assets[0].uri;
        setSelectedImage(nextImageUri);
        setValue('imageUrl', nextImageUri, {
          shouldDirty: true,
          shouldValidate: true,
        });
        clearErrors('imageUrl');
        setServerError('');
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setServerError(t('createPost.errors.failedPickImage'));
    }
  }, [clearErrors, setValue, t]);

  const onValidSubmit = useCallback(
    async (data: CreatePostFormData) => {
      setIsSubmitting(true);
      setServerError('');

      try {
        await createPost({
          type: data.type,
          caption: data.caption,
          hashtags: data.hashtags || undefined,
          imageUrl: data.imageUrl,
        });

        if (process.env.EXPO_OS !== 'web')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        back();
      } catch (err) {
        setServerError(t('createPost.errors.failedCreatePost'));
        console.error('Failed to create post:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [back, createPost, t]
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
            <HeaderAction
              onPress={rhfHandleSubmit(onValidSubmit)}
              disabled={!canSubmit}
              testID="submit-post-btn"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text className="text-sm font-bold text-primary dark:text-primary-bright">
                  {t('createPost.share')}
                </Text>
              )}
            </HeaderAction>
          ),
        }}
      />

      <ScrollView
        className="flex-1 px-5 pt-4"
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="mb-4">
          <Text className="text-text-secondary dark:text-text-secondary-dark mb-2 text-xs font-semibold uppercase tracking-wide">
            {t('createPost.types.title')}
          </Text>

          <Controller
            name="type"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <SelectionCard
                  label={t('createPost.types.showcaseLabel')}
                  description={t('createPost.types.showcaseDescription')}
                  selected={value === 'showcase'}
                  onPress={() => onChange('showcase')}
                  testID="post-type-showcase"
                />
                <SelectionCard
                  label={t('createPost.types.helpLabel')}
                  description={t('createPost.types.helpDescription')}
                  selected={value === 'help'}
                  onPress={() => onChange('help')}
                  testID="post-type-help"
                />
              </>
            )}
          />

          {errors.type && (
            <Text className="text-danger dark:text-error-dark mt-1 text-xs">
              {t(`common:${errors.type.message ?? 'validation.required'}`, {
                defaultValue: errors.type.message ?? 'validation.required',
              })}
            </Text>
          )}
        </View>

        <Controller
          name="caption"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              accessibilityRole="text"
              placeholder={captionPlaceholder}
              placeholderTextColor={
                isDark ? Colors.textMutedDark : Colors.textMuted
              }
              className="text-text dark:text-text-primary-dark min-h-30 text-base leading-6"
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
            {t(`common:${errors.caption.message ?? 'validation.required'}`, {
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
                className="absolute top-2 right-2 rounded-full bg-black/50 p-2 dark:bg-dark-bg-card/90"
                onPress={() => {
                  setSelectedImage(null);
                  setValue('imageUrl', '', {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                testID="remove-image-btn"
              >
                <PlatformIcon
                  sfName="xmark"
                  fallbackIcon={X}
                  size={16}
                  color={Colors.white}
                />
              </Pressable>
            </View>
          ) : null}

          {errors.imageUrl ? (
            <Text className="text-danger dark:text-error-dark mt-1 text-xs">
              {t(`common:${errors.imageUrl.message ?? 'validation.required'}`, {
                defaultValue: errors.imageUrl.message ?? 'validation.required',
              })}
            </Text>
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
            {t(`common:${errors.hashtags.message ?? 'validation.required'}`, {
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
