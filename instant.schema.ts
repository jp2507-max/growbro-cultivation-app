// instant.schema.ts
import { i } from '@instantdb/react-native';

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    profiles: i.entity({
      displayName: i.string(),
      experienceLevel: i.string().optional(),
      avatarUrl: i.string().optional(),
      hasCompletedOnboarding: i.boolean(),
      hasConfirmedAge: i.boolean(),
      createdAt: i.number(),
    }),
    plants: i.entity({
      name: i.string(),
      strainType: i.string(), // 'Indica' | 'Sativa' | 'Hybrid'
      environment: i.string(), // 'Indoor' | 'Outdoor'
      day: i.number(),
      phase: i.string(),
      weeksLeft: i.number(),
      readyPercent: i.number(),
      temp: i.string().optional(),
      humidity: i.string().optional(),
      ph: i.string().optional(),
      imageUrl: i.string().optional(),
      createdAt: i.number(),
    }),
    tasks: i.entity({
      title: i.string(),
      subtitle: i.string().optional(),
      dueTime: i.string().optional(),
      completed: i.boolean(),
      time: i.string().optional(), // schedule time e.g. '08:00 AM'
      status: i.string().optional(), // 'completed' | 'current' | 'upcoming'
      icon: i.string().optional(), // 'sun' | 'droplets' | 'flask' | 'moon'
      date: i.string().optional(), // ISO date string for scheduling
      createdAt: i.number(),
    }),
    posts: i.entity({
      caption: i.string(),
      imageUrl: i.string().optional(),
      label: i.string().optional(),
      hashtags: i.string().optional(),
      createdAt: i.number(),
    }),
    comments: i.entity({
      body: i.string(),
      createdAt: i.number(),
    }),
    likes: i.entity({
      createdAt: i.number(),
    }),
    strains: i.entity({
      name: i.string(),
      type: i.string().indexed(), // 'Indica' | 'Sativa' | 'Hybrid'
      thc: i.number().optional(),
      trait: i.string().optional(),
      imageUrl: i.string().optional(),
      createdBy: i.string().optional(), // 'admin' | user id — for filtering
    }),
  },
  links: {
    profileUser: {
      forward: { on: 'profiles', has: 'one', label: 'user' },
      reverse: { on: '$users', has: 'one', label: 'profile' },
    },
    plantOwner: {
      forward: { on: 'plants', has: 'one', label: 'owner' },
      reverse: { on: 'profiles', has: 'many', label: 'plants' },
    },
    taskPlant: {
      forward: { on: 'tasks', has: 'one', label: 'plant' },
      reverse: { on: 'plants', has: 'many', label: 'tasks' },
    },
    taskOwner: {
      forward: { on: 'tasks', has: 'one', label: 'owner' },
      reverse: { on: 'profiles', has: 'many', label: 'tasks' },
    },
    postAuthor: {
      forward: { on: 'posts', has: 'one', label: 'author' },
      reverse: { on: 'profiles', has: 'many', label: 'posts' },
    },
    postComments: {
      forward: { on: 'comments', has: 'one', label: 'post' },
      reverse: { on: 'posts', has: 'many', label: 'comments' },
    },
    commentAuthor: {
      forward: { on: 'comments', has: 'one', label: 'author' },
      reverse: { on: 'profiles', has: 'many', label: 'comments' },
    },
    postLikes: {
      forward: { on: 'likes', has: 'one', label: 'post' },
      reverse: { on: 'posts', has: 'many', label: 'likes' },
    },
    likeUser: {
      forward: { on: 'likes', has: 'one', label: 'user' },
      reverse: { on: 'profiles', has: 'many', label: 'likes' },
    },
  },
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
