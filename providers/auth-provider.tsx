import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useState } from 'react';

import { db, id } from '@/src/lib/instant';
import { storage } from '@/src/lib/storage';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert' | null;

const VALID_LEVELS = new Set(['beginner', 'intermediate', 'expert']);

const AGE_GATE_KEY = 'growbro_age_confirmed';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const { isLoading: isAuthLoading, user, error: authError } = db.useAuth();

  const [hasConfirmedAge, setHasConfirmedAge] = useState<boolean>(
    () => storage.getBoolean(AGE_GATE_KEY) ?? false
  );

  // Fetch user's profile when authenticated
  const { data: profileData, isLoading: isProfileLoading } = db.useQuery(
    user ? { profiles: { $: { where: { 'user.id': user.id } } } } : null
  );

  const profile = profileData?.profiles?.[0] ?? null;

  const isReady = !isAuthLoading && (!user || !isProfileLoading);
  const isAuthenticated = !!user;
  const hasCompletedOnboarding = profile?.hasCompletedOnboarding ?? false;
  const userName = profile?.displayName ?? '';
  const email = user?.email ?? '';
  const rawLevel = profile?.experienceLevel;
  const experienceLevel: ExperienceLevel =
    typeof rawLevel === 'string' && VALID_LEVELS.has(rawLevel)
      ? (rawLevel as ExperienceLevel)
      : null;

  // --- Auth actions ---

  const confirmAge = useCallback(() => {
    setHasConfirmedAge(true);
    storage.set(AGE_GATE_KEY, true);
  }, []);

  const sendMagicCode = useCallback(async (emailAddr: string) => {
    await db.auth.sendMagicCode({ email: emailAddr });
  }, []);

  const verifyMagicCode = useCallback(
    async (emailAddr: string, code: string) => {
      await db.auth.signInWithMagicCode({ email: emailAddr, code });
    },
    []
  );

  const createProfile = useCallback(
    async (displayName: string) => {
      if (!user) throw new Error('Not authenticated');
      const profileId = id();
      await db.transact([
        db.tx.profiles[profileId].update({
          displayName,
          hasCompletedOnboarding: false,
          hasConfirmedAge: true,
          createdAt: Date.now(),
        }),
        db.tx.profiles[profileId].link({ user: user.id }),
      ]);
    },
    [user]
  );

  const completeOnboarding = useCallback(
    async (level: ExperienceLevel) => {
      if (!profile) throw new Error('Profile not found');
      await db.transact(
        db.tx.profiles[profile.id].update({
          hasCompletedOnboarding: true,
          experienceLevel: level ?? undefined,
        })
      );
    },
    [profile]
  );

  const signOut = useCallback(async () => {
    await db.auth.signOut();
  }, []);

  return {
    isAuthenticated,
    hasCompletedOnboarding,
    hasConfirmedAge,
    userName,
    email,
    experienceLevel,
    isReady,
    user,
    profile,
    authError,
    isProfileLoading,
    confirmAge,
    sendMagicCode,
    verifyMagicCode,
    createProfile,
    completeOnboarding,
    signOut,
  };
});
