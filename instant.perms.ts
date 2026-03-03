// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from '@instantdb/react-native';

const rules = {
  blocks: {
    allow: {
      view: "auth.id != null && (auth.id in data.ref('blocker.user.id') || auth.id in data.ref('blocked.user.id'))",
      create: 'auth.id != null',
      delete: "auth.id != null && auth.id in data.ref('blocker.user.id')",
      update: 'false',
    },
  },
  favorites: {
    allow: {
      view: "auth.id != null && auth.id in data.ref('owner.user.id')",
      create: 'auth.id != null',
      delete: "auth.id != null && auth.id in data.ref('owner.user.id')",
      update: 'false',
    },
  },
  follows: {
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      delete: "auth.id != null && auth.id in data.ref('follower.user.id')",
      update: 'false',
    },
  },
  phaseMilestones: {
    allow: {
      view: "auth.id != null && auth.id in data.ref('owner.user.id')",
      create: 'auth.id != null',
      delete: "auth.id != null && auth.id in data.ref('owner.user.id')",
      update: "auth.id != null && auth.id in data.ref('owner.user.id')",
    },
  },
  healthChecks: {
    allow: {
      view: "auth.id != null && auth.id in data.ref('owner.user.id')",
      create: 'auth.id != null',
      delete: "auth.id != null && auth.id in data.ref('owner.user.id')",
      update: "auth.id != null && auth.id in data.ref('owner.user.id')",
    },
  },
  tasks: {
    allow: {
      view: "auth.id != null && auth.id in data.ref('owner.user.id')",
      create: 'auth.id != null',
      delete: "auth.id != null && auth.id in data.ref('owner.user.id')",
      update: "auth.id != null && auth.id in data.ref('owner.user.id')",
    },
  },
  strains: {
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      delete: "auth.id != null && auth.id in data.ref('creator.user.id')",
      update: "auth.id != null && auth.id in data.ref('creator.user.id')",
    },
  },
  profiles: {
    allow: {
      view: "auth.id != null && auth.id in data.ref('user.id')",
      create: 'auth.id != null',
      delete: 'false',
      update: "auth.id != null && auth.id in data.ref('user.id')",
    },
  },
  posts: {
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      delete: "auth.id != null && auth.id in data.ref('author.user.id')",
      update: "auth.id != null && auth.id in data.ref('author.user.id')",
    },
  },
  plants: {
    allow: {
      view: "auth.id != null && auth.id in data.ref('owner.user.id')",
      create: 'auth.id != null',
      delete: "auth.id != null && auth.id in data.ref('owner.user.id')",
      update: "auth.id != null && auth.id in data.ref('owner.user.id')",
    },
  },
  comments: {
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      delete: "auth.id != null && auth.id in data.ref('author.user.id')",
      update: "auth.id != null && auth.id in data.ref('author.user.id')",
    },
  },
  harvests: {
    allow: {
      view: "auth.id != null && auth.id in data.ref('owner.user.id')",
      create: 'auth.id != null',
      delete: "auth.id != null && auth.id in data.ref('owner.user.id')",
      update: "auth.id != null && auth.id in data.ref('owner.user.id')",
    },
  },
  notes: {
    allow: {
      view: "auth.id != null && auth.id in data.ref('owner.user.id')",
      create: 'auth.id != null',
      delete: "auth.id != null && auth.id in data.ref('owner.user.id')",
      update: "auth.id != null && auth.id in data.ref('owner.user.id')",
    },
  },
  reports: {
    allow: {
      view: "auth.id != null && auth.id in data.ref('reporter.user.id')",
      create: 'auth.id != null',
      delete: 'false',
      update: 'false',
    },
  },
  savedPosts: {
    allow: {
      view: "auth.id != null && auth.id in data.ref('owner.user.id')",
      create: 'auth.id != null',
      delete: "auth.id != null && auth.id in data.ref('owner.user.id')",
      update: 'false',
    },
  },
  $files: {
    bind: {
      isOwner: "auth.id != null && data.path.startsWith(auth.id + '/')",
    },
    allow: {
      view: 'isOwner',
      create: 'isOwner',
      delete: 'isOwner',
      update: 'isOwner',
    },
  },
  likes: {
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      delete: "auth.id != null && auth.id in data.ref('user.user.id')",
      update: 'false',
    },
  },
} satisfies InstantRules;

export default rules;
