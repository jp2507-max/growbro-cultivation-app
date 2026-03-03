import 'react-native-get-random-values';

import { id, init, type InstaQLEntity } from '@instantdb/react-native';
import Store from '@instantdb/react-native-mmkv';

import schema, { type AppSchema } from '../../instant.schema';

const APP_ID = process.env.EXPO_PUBLIC_INSTANT_APP_ID;

if (!APP_ID) {
  throw new Error(
    'EXPO_PUBLIC_INSTANT_APP_ID is missing. InstantDB requires a valid App ID to initialize.'
  );
}

export const db = init({
  appId: APP_ID,
  schema,
  Store,
});

type Unpacked<T> = T extends (infer U)[] ? U : T;
export type TransactionChunk = Unpacked<Parameters<typeof db.transact>[0]>;

export { id };
export type { AppSchema };

// Convenience entity types for use in components
export type Plant = InstaQLEntity<AppSchema, 'plants'>;
export type Task = InstaQLEntity<AppSchema, 'tasks'>;
export type Note = InstaQLEntity<AppSchema, 'notes'>;
export type PhaseMilestone = InstaQLEntity<AppSchema, 'phaseMilestones'>;
export type HealthCheck = InstaQLEntity<AppSchema, 'healthChecks'>;
export type Post = InstaQLEntity<
  AppSchema,
  'posts',
  { author: object; likes: object; comments: object }
>;
export type Comment = InstaQLEntity<
  AppSchema,
  'comments',
  { author: object; parent: object; replies: { author: object }; post: object }
>;
export type Strain = InstaQLEntity<AppSchema, 'strains'>;
export type Profile = InstaQLEntity<AppSchema, 'profiles'>;
export type Favorite = InstaQLEntity<AppSchema, 'favorites'>;
export type SavedPost = InstaQLEntity<
  AppSchema,
  'savedPosts',
  {
    owner: object;
    post: { author: object; likes: object; comments: object };
  }
>;
export type Report = InstaQLEntity<AppSchema, 'reports', { reporter: object }>;
export type Block = InstaQLEntity<
  AppSchema,
  'blocks',
  { blocker: object; blocked: object }
>;
export type Follow = InstaQLEntity<
  AppSchema,
  'follows',
  { follower: object; followee: object }
>;
