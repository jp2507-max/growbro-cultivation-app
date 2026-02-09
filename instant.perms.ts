// instant.perms.ts
// Permissions for InstantDB entities
// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from '@instantdb/react-native';

const rules = {
  profiles: {
    allow: {
      // Users can only view/edit their own profile
      view: "auth.id != null && data.ref('user.id') == auth.id",
      create: 'auth.id != null',
      update: "auth.id != null && data.ref('user.id') == auth.id",
      delete: 'false',
    },
  },
  plants: {
    allow: {
      // Users can only view/edit their own plants
      view: "auth.id != null && data.ref('owner.user.id') == auth.id",
      create: 'auth.id != null',
      update: "auth.id != null && data.ref('owner.user.id') == auth.id",
      delete: "auth.id != null && data.ref('owner.user.id') == auth.id",
    },
  },
  tasks: {
    allow: {
      // Users can only view/edit their own tasks
      view: "auth.id != null && data.ref('owner.user.id') == auth.id",
      create: 'auth.id != null',
      update: "auth.id != null && data.ref('owner.user.id') == auth.id",
      delete: "auth.id != null && data.ref('owner.user.id') == auth.id",
    },
  },
  posts: {
    allow: {
      // Anyone authenticated can view posts; only author can edit/delete
      view: 'auth.id != null',
      create: 'auth.id != null',
      update: "auth.id != null && data.ref('author.user.id') == auth.id",
      delete: "auth.id != null && data.ref('author.user.id') == auth.id",
    },
  },
  comments: {
    allow: {
      // Anyone authenticated can view/create; only author can edit/delete
      view: 'auth.id != null',
      create: 'auth.id != null',
      update: "auth.id != null && data.ref('author.user.id') == auth.id",
      delete: "auth.id != null && data.ref('author.user.id') == auth.id",
    },
  },
  likes: {
    allow: {
      // Anyone authenticated can view/create; only the liker can delete
      view: 'auth.id != null',
      create: 'auth.id != null',
      update: 'false',
      delete: "auth.id != null && data.ref('user.user.id') == auth.id",
    },
  },
  strains: {
    allow: {
      // Anyone authenticated can view and create strains
      view: 'auth.id != null',
      create: 'auth.id != null',
      update: 'auth.id != null',
      delete: 'false',
    },
  },
} satisfies InstantRules;

export default rules;
