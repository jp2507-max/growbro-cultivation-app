// instant.perms.ts
// Permissions for InstantDB entities
// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from '@instantdb/react-native';

const rules = {
  profiles: {
    allow: {
      // Users can only view/edit their own profile
      view: "auth.id != null && auth.id in data.ref('user.id')",
      create: 'auth.id != null',
      update: "auth.id != null && auth.id in data.ref('user.id')",
      delete: 'false',
    },
  },
  plants: {
    allow: {
      // Users can only view/edit their own plants
      view: "auth.id != null && auth.id in data.ref('owner.user.id')",
      create: 'auth.id != null',
      update: "auth.id != null && auth.id in data.ref('owner.user.id')",
      delete: "auth.id != null && auth.id in data.ref('owner.user.id')",
    },
  },
  tasks: {
    allow: {
      // Users can only view/edit their own tasks
      view: "auth.id != null && auth.id in data.ref('owner.user.id')",
      create: 'auth.id != null',
      update: "auth.id != null && auth.id in data.ref('owner.user.id')",
      delete: "auth.id != null && auth.id in data.ref('owner.user.id')",
    },
  },
  posts: {
    allow: {
      // Anyone authenticated can view posts; only author can edit/delete
      view: 'auth.id != null',
      create: 'auth.id != null',
      update: "auth.id != null && auth.id in data.ref('author.user.id')",
      delete: "auth.id != null && auth.id in data.ref('author.user.id')",
    },
  },
  comments: {
    allow: {
      // Anyone authenticated can view/create; only author can edit/delete
      view: 'auth.id != null',
      create: 'auth.id != null',
      update: "auth.id != null && auth.id in data.ref('author.user.id')",
      delete: "auth.id != null && auth.id in data.ref('author.user.id')",
    },
  },
  likes: {
    allow: {
      // Anyone authenticated can view/create; only the liker can delete
      view: 'auth.id != null',
      create: 'auth.id != null',
      update: 'false',
      delete: "auth.id != null && auth.id in data.ref('user.id')",
    },
  },
  strains: {
    allow: {
      // Anyone authenticated can view and create strains; only creator can edit/delete
      view: 'auth.id != null',
      create: 'auth.id != null',
      update: "auth.id != null && auth.id in data.ref('creator.user.id')",
      delete: "auth.id != null && auth.id in data.ref('creator.user.id')",
    },
  },
  favorites: {
    allow: {
      // Users can only view/delete their own favorites
      view: "auth.id != null && auth.id in data.ref('owner.user.id')",
      create: 'auth.id != null',
      update: 'false',
      delete: "auth.id != null && auth.id in data.ref('owner.user.id')",
    },
  },
} satisfies InstantRules;

export default rules;
