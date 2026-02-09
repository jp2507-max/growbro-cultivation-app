import 'react-native-get-random-values';
import './crypto-polyfill';

import { i, init } from '@instantdb/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const APP_ID = process.env.EXPO_PUBLIC_INSTANT_APP_ID;

// Define your schema here
const schema = i.schema({
  entities: {
    todos: i.entity({
      text: i.string(),
      done: i.boolean(),
      createdAt: i.number(),
    }),
  },
});

if (!APP_ID) {
  console.warn(
    'Missing EXPO_PUBLIC_INSTANT_APP_ID env variable. InstantDB will not work correctly.'
  );
}

// Explicit storage adapter to satisfy InstantDB interface
const storageAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

// Initialize the database
// @ts-ignore
export const db = init({
  appId: APP_ID || '',
  schema,
  // @ts-ignore
  storage: storageAdapter,
  // @ts-ignore
  network: NetInfo,
});
