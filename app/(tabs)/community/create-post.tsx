import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Stack from 'expo-router/stack';
import { Camera, Sparkles, Stethoscope, X } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { HeaderAction } from '@/src/components/ui/header-action';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { usePosts } from '@/src/hooks/use-posts';
import { type CreatePostFormData, createPostSchema } from '@/src/lib/forms';
import { ROUTES } from '@/src/lib/routes';
import { POST_MAX_CAPTION_LENGTH } from '@/src/lib/text-sanitization';
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
  const { t } = useTranslation(['community', 'common']);
  const router = useRouter();
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

  const postTypeOptions = [
    {
      value: 'showcase' as const,
      label: t('createPost.types.showcaseLabel'),
      description: t('createPost.types.showcaseDescription'),
      icon: Sparkles,
      iconColor: isDark ? Colors.primaryBright : Colors.primary,
      iconClassName: 'bg-primary/10 dark:bg-primary-bright/15',
      selectedClassName:
        'border-primary bg-primary/5 dark:border-primary-bright dark:bg-primary-bright/10',
      indicatorClassName:
        'border-primary bg-primary dark:border-primary-bright dark:bg-primary-bright',
    },
    {
      value: 'help' as const,
      label: t('createPost.types.helpLabel'),
      description: t('createPost.types.helpDescription'),
      icon: Stethoscope,
      iconColor: isDark ? Colors.warningDark : Colors.warning,
      iconClassName: 'bg-warning/10 dark:bg-warning-dark/15',
      selectedClassName:
        'border-warning/60 bg-warning/5 dark:border-warning-dark/60 dark:bg-warning-dark/10',
      indicatorClassName:
        'border-warning bg-warning dark:border-warning-dark dark:bg-warning-dark',
    },
  ];

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

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
        aspect: [4, 5],
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

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setValue('imageUrl', '', {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [setValue]);

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

        router.replace(ROUTES.COMMUNITY_POST_SUCCESS);
      } catch (err) {
        setServerError(t('createPost.errors.failedCreatePost'));
        console.error('Failed to create post:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [createPost, router, t]
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-dark-bg"
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
              onPress={handleClose}
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
              className="rounded-full bg-primary px-4 py-1.5 disabled:bg-primary/40 dark:bg-primary-bright dark:disabled:bg-primary-bright/40"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text className="text-sm font-bold text-white dark:text-dark-bg">
                  {t('createPost.share')}
                </Text>
              )}
            </HeaderAction>
          ),
        }}
      />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="gap-4 px-4 pb-8 pt-3">
          {/* ── Post Type Selector ── */}
          <View>
            <Text className="mb-2 text-[11px] font-semibold uppercase tracking-[1.4px] text-text-secondary dark:text-text-secondary-dark">
              {t('createPost.types.title')}
            </Text>

            <Controller
              name="type"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="gap-3">
                  {postTypeOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = value === option.value;

                    return (
                      <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        className={`rounded-3xl border px-4 py-4 dark:bg-dark-bg-card ${
                          isSelected
                            ? option.selectedClassName
                            : 'border-border-light bg-white dark:border-dark-border'
                        }`}
                        onPress={() => onChange(option.value)}
                        testID={`post-type-${option.value}`}
                      >
                        <View className="flex-row items-start gap-3">
                          <View
                            className={`mt-0.5 size-11 items-center justify-center rounded-2xl ${option.iconClassName}`}
                          >
                            <Icon size={18} color={option.iconColor} />
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-center gap-3">
                              <Text className="flex-1 text-base font-semibold leading-5 text-text dark:text-text-primary-dark">
                                {option.label}
                              </Text>
                              <View
                                className={`size-5 items-center justify-center rounded-full border ${
                                  isSelected
                                    ? option.indicatorClassName
                                    : 'border-border-light bg-transparent dark:border-dark-border'
                                }`}
                              >
                                {isSelected ? (
                                  <View className="size-2 rounded-full bg-white dark:bg-dark-bg" />
                                ) : null}
                              </View>
                            </View>
                            <Text className="mt-1.5 text-sm leading-5 text-text-secondary dark:text-text-secondary-dark">
                              {option.description}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />

            {errors.type ? (
              <Text className="mt-2 text-xs text-danger dark:text-error-dark">
                {t(`common:${errors.type.message ?? 'validation.required'}`, {
                  defaultValue: errors.type.message ?? 'validation.required',
                })}
              </Text>
            ) : null}
          </View>

          {/* ── Photo Upload Area ── */}
          <View>
            {selectedImage ? (
              <View className="relative overflow-hidden rounded-3xl">
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full rounded-3xl"
                  style={{ aspectRatio: 4 / 5 }}
                  contentFit="cover"
                />
                <Pressable
                  accessibilityRole="button"
                  className="absolute right-4 top-4 rounded-full bg-black/45 p-2.5 dark:bg-dark-bg-card/90"
                  onPress={handleRemoveImage}
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
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('createPost.addPhoto')}
                accessibilityHint={t('createPost.photoHint')}
                className="items-center justify-center rounded-3xl border-2 border-dashed border-border-light bg-card/60 dark:border-dark-border dark:bg-dark-bg-card/60"
                style={{ aspectRatio: 4 / 5 }}
                onPress={handleImagePicker}
                testID="add-image-btn"
              >
                <View className="size-14 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-bright/15">
                  <Camera
                    size={24}
                    color={isDark ? Colors.primaryBright : Colors.primary}
                  />
                </View>
                <Text className="mt-4 text-base font-semibold text-text dark:text-text-primary-dark">
                  {t('createPost.addPhoto')}
                </Text>
                <Text className="mt-1 text-sm text-text-muted dark:text-text-muted-dark">
                  {t('createPost.photoHint')}
                </Text>
              </Pressable>
            )}

            {errors.imageUrl ? (
              <Text className="mt-2 text-xs text-danger dark:text-error-dark">
                {t(
                  `common:${errors.imageUrl.message ?? 'validation.required'}`,
                  {
                    defaultValue:
                      errors.imageUrl.message ?? 'validation.required',
                  }
                )}
              </Text>
            ) : null}
          </View>

          {/* ── Caption Input ── */}
          <View>
            <View className="rounded-3xl border border-border-light bg-white px-4 py-4 dark:border-dark-border dark:bg-dark-bg-card">
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
                    className="min-h-32 text-base leading-6 text-text dark:text-text-primary-dark"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    textAlignVertical="top"
                    testID="caption-input"
                    maxLength={POST_MAX_CAPTION_LENGTH}
                  />
                )}
              />
              <Text className="mt-2 self-end text-xs text-text-muted dark:text-text-muted-dark">
                {captionValue.length}/{POST_MAX_CAPTION_LENGTH}
              </Text>
            </View>
            {errors.caption ? (
              <Text className="mt-2 text-xs text-danger dark:text-error-dark">
                {t(
                  `common:${errors.caption.message ?? 'validation.required'}`,
                  {
                    defaultValue:
                      errors.caption.message ?? 'validation.required',
                  }
                )}
              </Text>
            ) : null}
          </View>

          {/* ── Hashtag Input ── */}

          {/* ── Server Error ── */}
          {serverError ? (
            <Text
              className="text-sm font-semibold text-danger dark:text-error-dark"
              selectable
            >
              {serverError}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
