// keystone.ts
import { config, graphQLSchemaExtension } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { KeystoneConfig, BaseKeystoneTypeInfo } from '@keystone-6/core/types';
import { withAuth } from './auth';
import { DATABASE_URL, SESSION_MAX_AGE, SESSION_SECRET } from './config';
import { lists } from './lists';
import { customTypeDefs, customResolvers } from './utils/gqlHelper';

// Stateless sessions will store the listKey and itemId of the signed-in user in a cookie.
// This session object will be made available on the context object used in hooks, access-control,
// resolvers, etc.
const session = statelessSessions({
  maxAge: SESSION_MAX_AGE,
  // The session secret is used to encrypt cookie data (should be an environment variable)
  secret: SESSION_SECRET,
});

export default config(
  withAuth({
    db: {
      provider: 'postgresql',
      url: DATABASE_URL,
      useMigrations: true,
      idField: { kind: 'uuid' },
    },
    lists,
    session,
    ui: {
      isAccessAllowed: (context) => !!context.session?.data,
    },
    extendGraphqlSchema: graphQLSchemaExtension({ typeDefs: customTypeDefs, resolvers: customResolvers }),
  }),
) as KeystoneConfig<BaseKeystoneTypeInfo>;
