// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from '@instantdb/react-native';

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $streams: i.entity({
      abortReason: i.string().optional(),
      clientId: i.string().unique().indexed(),
      done: i.boolean().optional(),
      size: i.number().optional(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    comments: i.entity({
      body: i.string(),
      createdAt: i.number(),
    }),
    favorites: i.entity({
      createdAt: i.number().indexed(),
      uniqueKey: i.string().unique(),
    }),
    harvests: i.entity({
      createdAt: i.number().indexed(),
      dryWeight: i.number().optional(),
      notes: i.string().optional(),
      plantName: i.string().optional(),
      quality: i.string(),
      wetWeight: i.number(),
    }),
    likes: i.entity({
      createdAt: i.number(),
      uniqueKey: i.string().unique(),
    }),
    plants: i.entity({
      autoCreateTasks: i.boolean().optional(),
      containerSize: i.number().optional(),
      containerUnit: i.string().optional(),
      createdAt: i.number().indexed(),
      day: i.number(),
      environment: i.string(),
      feedingCadenceDays: i.number().optional(),
      humidity: i.number().optional(),
      imageUrl: i.string().optional(),
      lightSchedulePreset: i.string().optional(),
      lightType: i.string().optional(),
      medium: i.string().optional(),
      name: i.string(),
      notes: i.string().optional(),
      ph: i.number().optional(),
      phase: i.string().indexed(),
      phMax: i.number().optional(),
      phMin: i.number().optional(),
      readyPercent: i.number(),
      reminderTimeLocal: i.string().optional(),
      sourceStartDate: i.string().optional(),
      sourceType: i.string().optional(),
      strainId: i.string().optional(),
      strainName: i.string().optional(),
      strainType: i.string(),
      temp: i.number().optional(),
      tempDay: i.number().optional(),
      tempNight: i.number().optional(),
      wateringCadenceDays: i.number().optional(),
      weeksLeft: i.number(),
    }),
    posts: i.entity({
      caption: i.string(),
      createdAt: i.number().indexed(),
      hashtags: i.string().optional(),
      imageUrl: i.string().optional(),
      label: i.string().optional(),
    }),
    profiles: i.entity({
      avatarUrl: i.string().optional(),
      createdAt: i.number(),
      displayName: i.string(),
      experienceLevel: i.string().optional(),
      hasCompletedOnboarding: i.boolean(),
      hasConfirmedAge: i.boolean(),
    }),
    strains: i.entity({
      cbdDisplay: i.string().optional(),
      description: i.string().optional(),
      difficulty: i.string().indexed().optional(),
      effects: i.string().optional(),
      flavors: i.string().optional(),
      floweringTimeLabel: i.string().optional(),
      floweringWeeksMax: i.number().optional(),
      floweringWeeksMin: i.number().optional(),
      genetics: i.string().optional(),
      heightIndoor: i.string().optional(),
      heightOutdoor: i.string().optional(),
      imageUrl: i.string().optional(),
      isAdminSeeded: i.boolean().indexed(),
      isAutoflower: i.boolean().optional(),
      name: i.string(),
      slug: i.string().optional(),
      sourceUrl: i.string().optional(),
      thc: i.number().optional(),
      thcMax: i.number().optional(),
      thcMin: i.number().optional(),
      trait: i.string().optional(),
      type: i.string().indexed(),
      yieldIndoor: i.string().optional(),
      yieldOutdoor: i.string().optional(),
    }),
    tasks: i.entity({
      completed: i.boolean().indexed(),
      createdAt: i.number().indexed(),
      date: i.string().indexed().optional(),
      dueTime: i.string().optional(),
      icon: i.string().optional(),
      subtitle: i.string().optional(),
      time: i.string().optional(),
      title: i.string(),
    }),
  },
  links: {
    $streams$files: {
      forward: {
        on: '$streams',
        has: 'many',
        label: '$files',
      },
      reverse: {
        on: '$files',
        has: 'one',
        label: '$stream',
        onDelete: 'cascade',
      },
    },
    $usersLinkedPrimaryUser: {
      forward: {
        on: '$users',
        has: 'one',
        label: 'linkedPrimaryUser',
        onDelete: 'cascade',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'linkedGuestUsers',
      },
    },
    commentsAuthor: {
      forward: {
        on: 'comments',
        has: 'one',
        label: 'author',
      },
      reverse: {
        on: 'profiles',
        has: 'many',
        label: 'comments',
      },
    },
    commentsPost: {
      forward: {
        on: 'comments',
        has: 'one',
        label: 'post',
      },
      reverse: {
        on: 'posts',
        has: 'many',
        label: 'comments',
      },
    },
    favoritesOwner: {
      forward: {
        on: 'favorites',
        has: 'one',
        label: 'owner',
      },
      reverse: {
        on: 'profiles',
        has: 'many',
        label: 'favorites',
      },
    },
    favoritesStrain: {
      forward: {
        on: 'favorites',
        has: 'one',
        label: 'strain',
      },
      reverse: {
        on: 'strains',
        has: 'many',
        label: 'favorites',
      },
    },
    harvestsOwner: {
      forward: {
        on: 'harvests',
        has: 'one',
        label: 'owner',
      },
      reverse: {
        on: 'profiles',
        has: 'many',
        label: 'harvests',
      },
    },
    harvestsPlant: {
      forward: {
        on: 'harvests',
        has: 'one',
        label: 'plant',
      },
      reverse: {
        on: 'plants',
        has: 'many',
        label: 'harvests',
      },
    },
    likesPost: {
      forward: {
        on: 'likes',
        has: 'one',
        label: 'post',
      },
      reverse: {
        on: 'posts',
        has: 'many',
        label: 'likes',
      },
    },
    likesUser: {
      forward: {
        on: 'likes',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: 'profiles',
        has: 'many',
        label: 'likes',
      },
    },
    plantsOwner: {
      forward: {
        on: 'plants',
        has: 'one',
        label: 'owner',
      },
      reverse: {
        on: 'profiles',
        has: 'many',
        label: 'plants',
      },
    },
    postsAuthor: {
      forward: {
        on: 'posts',
        has: 'one',
        label: 'author',
      },
      reverse: {
        on: 'profiles',
        has: 'many',
        label: 'posts',
      },
    },
    profilesUser: {
      forward: {
        on: 'profiles',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'one',
        label: 'profile',
      },
    },
    strainsCreator: {
      forward: {
        on: 'strains',
        has: 'one',
        label: 'creator',
      },
      reverse: {
        on: 'profiles',
        has: 'many',
        label: 'createdStrains',
      },
    },
    tasksOwner: {
      forward: {
        on: 'tasks',
        has: 'one',
        label: 'owner',
      },
      reverse: {
        on: 'profiles',
        has: 'many',
        label: 'tasks',
      },
    },
    tasksPlant: {
      forward: {
        on: 'tasks',
        has: 'one',
        label: 'plant',
      },
      reverse: {
        on: 'plants',
        has: 'many',
        label: 'tasks',
      },
    },
  },
  rooms: {},
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
type AppSchema = _AppSchema;
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
