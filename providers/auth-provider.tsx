import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert' | null;

interface AuthState {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  hasConfirmedAge: boolean;
  userName: string;
  email: string;
  experienceLevel: ExperienceLevel;
}

const AUTH_KEY = 'growbro_auth';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    hasCompletedOnboarding: false,
    hasConfirmedAge: false,
    userName: '',
    email: '',
    experienceLevel: null,
  });
  const [isReady, setIsReady] = useState<boolean>(false);

  const authQuery = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(AUTH_KEY);
      return stored ? (JSON.parse(stored) as AuthState) : null;
    },
  });

  useEffect(() => {
    if (authQuery.data !== undefined) {
      if (authQuery.data) {
        setAuthState(authQuery.data);
      }
      setIsReady(true);
    }
    if (authQuery.isError) {
      setIsReady(true);
    }
  }, [authQuery.data, authQuery.isError]);

  const persistMutation = useMutation({
    mutationFn: async (state: AuthState) => {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(state));
      return state;
    },
  });

  const { mutate } = persistMutation;

  const confirmAge = useCallback(() => {
    setAuthState((prev) => {
      const newState: AuthState = { ...prev, hasConfirmedAge: true };
      mutate(newState);
      return newState;
    });
  }, [mutate]);

  const signUp = useCallback(
    (name: string, email: string) => {
      const newState: AuthState = {
        isAuthenticated: true,
        hasCompletedOnboarding: false,
        hasConfirmedAge: true,
        userName: name,
        email,
        experienceLevel: null,
      };
      setAuthState(newState);
      mutate(newState);
    },
    [mutate]
  );

  const signIn = useCallback(
    (email: string) => {
      setAuthState((prev) => {
        const newState: AuthState = {
          ...prev,
          isAuthenticated: true,
          hasCompletedOnboarding: true,
          hasConfirmedAge: true,
          email,
        };
        mutate(newState);
        return newState;
      });
    },
    [mutate]
  );

  const completeOnboarding = useCallback(
    (level: ExperienceLevel) => {
      setAuthState((prev) => {
        const newState: AuthState = {
          ...prev,
          hasCompletedOnboarding: true,
          experienceLevel: level,
        };
        mutate(newState);
        return newState;
      });
    },
    [mutate]
  );

  const signOut = useCallback(async () => {
    const newState: AuthState = {
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      hasConfirmedAge: false,
      userName: '',
      email: '',
      experienceLevel: null,
    };
    setAuthState(newState);
    await AsyncStorage.removeItem(AUTH_KEY);
    queryClient.invalidateQueries({ queryKey: ['auth'] });
  }, [queryClient]);

  return {
    ...authState,
    isReady,
    confirmAge,
    signUp,
    signIn,
    completeOnboarding,
    signOut,
  };
});
