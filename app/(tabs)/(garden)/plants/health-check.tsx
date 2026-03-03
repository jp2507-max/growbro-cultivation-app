import Stack from 'expo-router/stack';
import React from 'react';

import { WeeklyHealthCheckScreen } from '@/src/screens/weekly-health-check-screen';

export default function PlantHealthCheckRoute(): React.ReactElement {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WeeklyHealthCheckScreen />
    </>
  );
}
