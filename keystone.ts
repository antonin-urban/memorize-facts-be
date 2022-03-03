// keystone.ts
import { config } from '@keystone-6/core';
import { session, withAuth } from './auth';
import { lists } from './schemas/schema';

export default config(
  withAuth({
    db: {
      provider: 'sqlite', // TODO: switch to postgres after MVP development
      url: 'file:./keystone.db',
      //enableLogging: true,
      useMigrations: false,
      idField: { kind: 'uuid' },
    },
    lists,
    session,
    ui: {
      isAccessAllowed: (context) => !!context.session?.data,
    },
  }),
);
