import { text } from '@keystone-6/core/fields';

export const ownerId = text({
  access: {
    update: () => false,
  },
  ui: {
    createView: {
      fieldMode: 'hidden',
    },
    itemView: {
      fieldMode: 'read',
    },
  },
});
