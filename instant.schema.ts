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
      phase: i.string().indexed(),
      weeksLeft: i.number(),
      readyPercent: i.number(),
      temp: i.number().optional(),
      humidity: i.number().optional(),
      ph: i.number().optional(),
      imageUrl: i.string().optional(),
      createdAt: i.number().indexed(),
    }),
    tasks: i.entity({
      title: i.string(),
      subtitle: i.string().optional(),
      dueTime: i.string().optional(),
      completed: i.boolean().indexed(),
      time: i.string().optional(), // schedule time e.g. '08:00 AM'
      icon: i.string().optional(), // 'sun' | 'droplets' | 'flask' | 'moon'
      date: i.string().optional().indexed(), // ISO date string for scheduling
      createdAt: i.number().indexed(),
    }),
    posts: i.entity({
      caption: i.string(),
      imageUrl: i.string().optional(),
      label: i.string().optional(),
      hashtags: i.string().optional(),
      createdAt: i.number().indexed(),
    }),
    comments: i.entity({
      body: i.string(),
      createdAt: i.number(),
    }),
    likes: i.entity({
      createdAt: i.number(),
      uniqueKey: i.string().unique(), // Composite key: `${userId}_${postId}`
    }),
    strains: i.entity({
      name: i.string(),
      slug: i.string().optional(),
      type: i.string().indexed(), // 'Indica' | 'Sativa' | 'Hybrid'
      genetics: i.string().optional(), // e.g. 'Indica-dominant (80%)'
      isAutoflower: i.boolean().optional(),
      thc: i.number().optional(), // display value (thcMax)
      thcMin: i.number().optional(),
      thcMax: i.number().optional(),
      cbdDisplay: i.string().optional(), // 'Unknown' | 'Low' | etc.
      // TODO: JSON array strings limit server-side filtering capabilities.
      // To support filtering by effect/flavor efficiently, we should migrate to:
      // 1. New entities for 'effects' and 'flavors'
      // 2. Many-to-many relationships (links) between strains and these entities.
      // Current implementation requires client-side filtering after fetching.
      effects: i.string().optional(), // JSON array string: '["Relaxed","Happy"]'
      flavors: i.string().optional(), // JSON array string: '["Sweet","Earthy"]'
      difficulty: i.string().optional().indexed(), // 'Easy' | 'Medium' | 'Difficult'
      floweringTimeLabel: i.string().optional(), // '8-9 weeks'
      floweringWeeksMin: i.number().optional(),
      floweringWeeksMax: i.number().optional(),
      yieldIndoor: i.string().optional(), // '500g/m²'
      yieldOutdoor: i.string().optional(), // '250-400g/plant'
      heightIndoor: i.string().optional(), // 'Short' | 'Medium' | 'Tall'
      heightOutdoor: i.string().optional(),
      description: i.string().optional(), // joined paragraphs
      sourceUrl: i.string().optional(), // external link
      trait: i.string().optional(),
      imageUrl: i.string().optional(),
      isAdminSeeded: i.boolean(), // true for admin/global strains
    }),
    favorites: i.entity({
      createdAt: i.number().indexed(),
      uniqueKey: i.string().unique(), // Composite key: `${profileId}_${strainId}`
    }),
    harvests: i.entity({
      wetWeight: i.number(),
      dryWeight: i.number().optional(),
      notes: i.string().optional(),
      quality: i.string(), // 'poor' | 'good' | 'great' | 'premium'
      plantName: i.string().optional(),
      createdAt: i.number().indexed(),
    }),
  },
  links: {
    strainCreator: {
      forward: { on: 'strains', has: 'one', label: 'creator' },
      reverse: { on: 'profiles', has: 'many', label: 'createdStrains' },
    },
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
    favoriteStrain: {
      forward: { on: 'favorites', has: 'one', label: 'strain' },
      reverse: { on: 'strains', has: 'many', label: 'favorites' },
    },
    favoriteOwner: {
      forward: { on: 'favorites', has: 'one', label: 'owner' },
      reverse: { on: 'profiles', has: 'many', label: 'favorites' },
    },
    harvestPlant: {
      forward: { on: 'harvests', has: 'one', label: 'plant' },
      reverse: { on: 'plants', has: 'many', label: 'harvests' },
    },
    harvestOwner: {
      forward: { on: 'harvests', has: 'one', label: 'owner' },
      reverse: { on: 'profiles', has: 'many', label: 'harvests' },
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
