import { text, checkbox, timestamp } from '@keystone-6/core/fields';

export const ownerId = text({
  access: {
    update: () => false,
    create: () => false,
  },
  ui: {
    createView: {
      fieldMode: 'hidden',
    },
    itemView: {
      fieldMode: 'read',
    },
    listView: {
      fieldMode: 'read',
    },
  },
  graphql: {
    omit: true,
  },
});

export const frontendId = text({
  access: {
    update: () => false,
  },
  validation: { isRequired: true },
  isIndexed: 'unique',
  ui: {
    itemView: {
      fieldMode: 'read',
    },
    listView: {
      fieldMode: 'read',
    },
  },
});

export const deleted = checkbox({
  ui: {
    createView: {
      fieldMode: 'hidden',
    },
    itemView: {
      fieldMode: 'read',
    },
    listView: {
      fieldMode: 'read',
    },
  },
  graphql: {},
});

export const updatedAt = timestamp({
  ui: {
    createView: {
      fieldMode: 'hidden',
    },
    itemView: {
      fieldMode: 'read',
    },
    listView: {
      fieldMode: 'read',
    },
  },
  db: {
    updatedAt: true,
  },
});
