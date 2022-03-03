import { createAuth } from '@keystone-6/auth';
import { statelessSessions } from '@keystone-6/core/session';

export type Session = {
  data: {
    id: string;
    isAdmin: boolean;
  };
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  sessionData: 'id, isAdmin',
  secretField: 'password',
  initFirstItem: {
    fields: ['email', 'password'],
    itemData: { isAdmin: true },
  },
});

const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
const sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

const session = statelessSessions({
  maxAge: sessionMaxAge,
  secret: sessionSecret,
});

export { withAuth, session };
