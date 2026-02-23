// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from '@instantdb/react-native';

const rules = {
  favorites: {
    allow: {
      view: "auth.id != null && auth.id in data.ref('owner.user.id')",
      create: 'auth.id != null',
      delete: "auth.id != null && auth.id in data.ref('owner.user.id')",
      update: 'false',
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
