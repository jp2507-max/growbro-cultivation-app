import Stack from 'expo-router/stack';
import React from 'react';

import { PlantDetailScreen } from '@/src/screens/plant-detail-screen';

export default function PlantDetailRoute(): React.ReactElement {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PlantDetailScreen />
    </>
  );
}
