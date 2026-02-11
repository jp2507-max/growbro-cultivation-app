import 'react-native-get-random-values';

import { id, init, type InstaQLEntity } from '@instantdb/react-native';
import Store from '@instantdb/react-native-mmkv';

import schema, { type AppSchema } from '../../instant.schema';

const APP_ID = process.env.EXPO_PUBLIC_INSTANT_APP_ID;

if (!APP_ID) {
  console.warn(
    'Missing EXPO_PUBLIC_INSTANT_APP_ID env variable. InstantDB will not work correctly.'
  );
}

export const db = init({
  appId: APP_ID || '',
  schema,
  Store,
});

export { id };
export type { AppSchema };

// Convenience entity types for use in components
export type Plant = InstaQLEntity<AppSchema, 'plants'>;
export type Task = InstaQLEntity<AppSchema, 'tasks'>;
export type Post = InstaQLEntity<
  AppSchema,
  'posts',
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  { author: {}; likes: {}; comments: {} }
>;
export type Strain = InstaQLEntity<AppSchema, 'strains'>;
export type Profile = InstaQLEntity<AppSchema, 'profiles'>;
export type Favorite = InstaQLEntity<AppSchema, 'favorites'>;
