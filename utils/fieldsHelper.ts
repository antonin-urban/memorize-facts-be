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

export const deleted = checkbox({
  access: {
    update: () => false,
    create: () => false,
  },
  ui: {
    createView: {
      fieldMode: 'hidden',
    },
    itemView: {
      fieldMode: 'hidden',
    },
    listView: {
      fieldMode: 'hidden',
    },
  },
  graphql: {
    omit: true,
  },
});

export const updatedAt = timestamp({
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
  db: {
    updatedAt: true,
  },
});
