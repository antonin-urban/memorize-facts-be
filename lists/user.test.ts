import { setupTestEnv, setupTestRunner, TestEnv } from '@keystone-6/core/testing';
import { KeystoneContext } from '@keystone-6/core/types';
import { Session } from '../auth';
import config from '../keystone';
import { ScheduleType } from './schedule';

const USER_TEST_SESSION_FAKE_ID = 'user-test-session-id';
const ADMIN_TEST_SESSION_FAKE_ID = 'admin-test-session-id';

const USER_TEST_SESSION: Session = {
  data: {
    id: USER_TEST_SESSION_FAKE_ID,
    isAdmin: false,
  },
};

const ADMIN_TEST_SESSION: Session = {
  data: {
    id: ADMIN_TEST_SESSION_FAKE_ID,
    isAdmin: true,
  },
};

const runner = setupTestRunner({ config });
describe('User validations tests', () => {
  it(
    'fails to create second user with same email (already registered)',
    runner(async ({ context }) => {
      const firsUser = await context.withSession(undefined).graphql.raw({
        query: `mutation {
          createUser(
            data: {
              email: "user@email.com"
              password: "password1234"
            }
          ) {
            email
          }
        }`,
      });

      expect(firsUser.errors).toBeUndefined();
      expect(firsUser.data.createUser).toBeDefined();

      const secondUser = await context.withSession(undefined).graphql.raw({
        query: `mutation {
          createUser(
            data: {
              email: "user@email.com"
              password: "password1234"
            }
          ) {
            email
          }
        }`,
      });

      expect(secondUser.data.createUser).toBeNull();
      expect(secondUser.errors).toHaveLength(1);
      expect(secondUser.errors[0].path).toEqual(['createUser']);
      expect(secondUser.errors[0].message).toMatch('Prisma error: Unique constraint failed on the fields: (`email`)');
    }),
  );

  it(
    'fails when user creates itself with isAdmin',
    runner(async ({ context }) => {
      const { data, errors } = await context.withSession(undefined).graphql.raw({
        query: `mutation {
          createUser(
            data: {
              email: "user@email.com"
              password: "password1234"
              isAdmin: true
            }
          ) {
            id
            email
          }
        }`,
      });

      expect(data.createUser).toBeNull();
      expect(errors).toHaveLength(1);
      expect(errors[0].path).toEqual(['createUser']);
      expect(errors[0].message).toMatch('You cannot create the fields ["isAdmin"]');
    }),
  );

  it(
    'fails when user updates isAdmin',
    runner(async ({ context }) => {
      const firsUser = await context.withSession(undefined).graphql.raw({
        query: `mutation {
          createUser(
            data: {
              email: "user@email.com"
              password: "password1234",
            }
          ) {
            id
            email
          }
        }`,
      });

      expect(firsUser.errors).toBeUndefined();
      expect(firsUser.data.createUser).toBeDefined();

      const secondUser = await context
        .withSession({
          data: {
            id: firsUser.data.createUser.id,
            isAdmin: false, //user is not admin
          },
        } as Session)
        .graphql.raw({
          query: `mutation{
          updateUser(where:{
            id:"${firsUser.data.createUser.id}"
          }, data: {
            isAdmin: true
          })
          {
            isAdmin
          }
        }`,
        });

      expect(secondUser.data.updateUser).toBeNull();
      expect(secondUser.errors).toHaveLength(1);
      expect(secondUser.errors[0].path).toEqual(['updateUser']);
      expect(secondUser.errors[0].message).toMatch('You cannot update the fields ["isAdmin"]');
    }),
  );

  it(
    'inits isAdmin to false for user',
    runner(async ({ context }) => {
      const { data, errors } = await context.withSession(undefined).graphql.raw({
        query: `mutation {
          createUser(
            data: {
              email: "user@email.com"
              password: "password1234"
            }
          ) {
            isAdmin
          }
        }`,
      });

      expect(errors).toBeUndefined();
      expect(data.createUser).toBeDefined();
      expect(data.createUser.isAdmin).toEqual(false);
    }),
  );

  it(
    'successes when admin creates another admin',
    runner(async ({ context }) => {
      const { data, errors } = await context.withSession(ADMIN_TEST_SESSION).graphql.raw({
        query: `mutation {
          createUser(
            data: {
              email: "user@email.com"
              password: "password1234",
              isAdmin: true
            }
          ) {
            isAdmin
          }
        }`,
      });

      expect(errors).toBeUndefined();
      expect(data.createUser).toBeDefined();
      expect(data.createUser.isAdmin).toEqual(true);
    }),
  );

  it(
    'successes when admin updates isAdmin',
    runner(async ({ context }) => {
      const firsUser = await context.withSession(ADMIN_TEST_SESSION).graphql.raw({
        query: `mutation {
          createUser(
            data: {
              email: "user@email.com"
              password: "password1234",
              isAdmin: false
            }
          ) {
            id
          }
        }`,
      });

      expect(firsUser.errors).toBeUndefined();
      expect(firsUser.data.createUser).toBeDefined();

      const secondUser = await context.withSession(ADMIN_TEST_SESSION).graphql.raw({
        query: `mutation{
          updateUser(where:{
            id:"${firsUser.data.createUser.id}"
          }, data: {
            isAdmin: true
          })
          {
            isAdmin
          }
        }`,
      });

      expect(secondUser.errors).toBeUndefined();
      expect(secondUser.data.updateUser).toBeDefined();
      expect(secondUser.data.updateUser.isAdmin).toEqual(true);
    }),
  );
});

describe('User access control test', () => {
  describe('CREATE', () => {
    it(
      'successes when session is admin (administration)', // logged admin can create a user, even admin ones
      runner(async ({ context }) => {
        const { data, errors } = await context.withSession(ADMIN_TEST_SESSION).graphql.raw({
          query: `mutation {
            createUser(
              data: {
                email: "user@email.com"
                password: "password1234",
                isAdmin: true
              }
            ) {
              email
            }
          }`,
        });

        expect(errors).toBeUndefined();
        expect(data.createUser).toBeDefined();
      }),
    );

    it(
      'successes when session is missing (registration)', // only empty session can create a user - aka register
      runner(async ({ context }) => {
        const { data, errors } = await context.withSession(undefined).graphql.raw({
          query: `mutation {
            createUser(
              data: {
                email: "user@email.com"
                password: "password1234",
              }
            ) {
              email
            }
          }`,
        });

        expect(errors).toBeUndefined();
        expect(data.createUser).toBeDefined();
      }),
    );

    it(
      'fails when session is user', // logged user cannot create other users
      runner(async ({ context }) => {
        const { data, errors } = await context.withSession(USER_TEST_SESSION).graphql.raw({
          query: `mutation {
            createUser(
              data: {
                email: "user@email.com"
                password: "password1234"
              }
            ) {
              email
            }
          }`,
        });

        expect(data.createUser).toBeNull();
        expect(errors).toHaveLength(1);
        expect(errors[0].path).toEqual(['createUser']);
        expect(errors[0].message).toMatch(
          "Access denied: You cannot perform the 'create' operation on the list 'User'.",
        );
      }),
    );
  });

  describe('READ', () => {
    let testEnv: TestEnv;
    let context: KeystoneContext;
    let adminId: string;
    let userId: string;

    const userTestSession: Session = {
      data: {
        id: '',
        isAdmin: false,
      },
    };

    beforeAll(async () => {
      testEnv = await setupTestEnv({ config });
      context = testEnv.testArgs.context;

      await testEnv.connect();

      let result = await context.withSession(ADMIN_TEST_SESSION).query.User.createOne({
        data: {
          email: 'admin@email.com',
          password: 'admin1234',
          isAdmin: true,
        },
        query: 'id',
      });

      adminId = result.id;

      result = await context.withSession(undefined).query.User.createOne({
        data: {
          email: 'user@email.com',
          password: 'user1234',
        },
        query: 'id',
      });

      userTestSession.data.id = result.id;

      userId = result.id;
    });

    afterAll(async () => {
      await testEnv.disconnect();
    });

    it('user query - successes when user requests own user data', async () => {
      const { data, errors } = await context.withSession(userTestSession).graphql.raw({
        query: `query{     
              user(where: {id: "${userId}" }) {
                email
              }
            }`,
      });

      expect(errors).toBeUndefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toEqual('user@email.com');
    });

    it('user query - successes when user requests own data', async () => {
      const { data, errors } = await context.withSession(userTestSession).graphql.raw({
        query: `query{     
              user(where: {id: "${userId}" }) {
                email
              }
            }`,
      });

      expect(errors).toBeUndefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toEqual('user@email.com');
    });

    it('user query - successes when admin requests own data', async () => {
      const { data, errors } = await context.withSession(ADMIN_TEST_SESSION).graphql.raw({
        query: `query{     
              user(where: {id: "${adminId}" }) {
                email
              }
            }`,
      });

      expect(errors).toBeUndefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toEqual('admin@email.com');
    });

    it('user query - successes when admin requests foreign data', async () => {
      const { data, errors } = await context.withSession(ADMIN_TEST_SESSION).graphql.raw({
        query: `query{     
              user(where: {id: "${userId}" }) {
                email
              }
            }`,
      });

      expect(errors).toBeUndefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toEqual('user@email.com');
    });

    it('user query - returns null when user requests foreign data', async () => {
      const { data, errors } = await context.withSession(userTestSession).graphql.raw({
        query: `query{     
              user(where: {id: "${adminId}" }) {
                email
              }
            }`,
      });

      expect(errors).toBeUndefined();
      expect(data.user).toBeNull();
    });

    it('user query - returns null when session is empty', async () => {
      const { data, errors } = await context.withSession(undefined).graphql.raw({
        query: `query{     
              user(where: {id: "${adminId}" }) {
                email
              }
            }`,
      });

      expect(errors).toBeUndefined();
      expect(data.user).toBeNull();
    });

    it('users query - returns all users for admin', async () => {
      const { data, errors } = await context.withSession(ADMIN_TEST_SESSION).graphql.raw({
        query: `query{     
              users {
                email
                isAdmin
              }
            }`,
      });

      expect(errors).toBeUndefined();
      expect(data.users).toBeDefined();
      expect(data.users).toHaveLength(2);
      expect([...data.users.map(({ email, isAdmin }) => ({ email, isAdmin }))].sort()).toMatchObject(
        [
          {
            email: 'admin@email.com',
            isAdmin: true,
          },
          {
            email: 'user@email.com',
            isAdmin: false,
          },
        ].sort(),
      );
    });

    it('users query - returns only session user for user', async () => {
      const { data, errors } = await context.withSession(userTestSession).graphql.raw({
        query: `query{     
              users {
                email
              }
            }`,
      });

      expect(errors).toBeUndefined();
      expect(data.users).toBeDefined();
      expect(data.users).toHaveLength(1);
      expect(data.users[0].email).toEqual('user@email.com');
    });

    it('admin cannot acces foreign user data from other tables (Schedule, Tag, Fact)', async () => {
      const schedule = await context.withSession(USER_TEST_SESSION).graphql.raw({
        query: `mutation {
            createSchedule(
              data: {
                name: "test"
                type: ${ScheduleType.NOTIFY_EVERY},
                scheduleParameters: {
                  interval: 10,
                  dayOfWeek: [true, true, true, true, true, true, true]
                }
                frontendId: "9b29096a-3adc-43dc-831f-4808177d9249"
              }
            ) {
              id
            }
          }`,
      });

      expect(schedule.errors).toBeUndefined();
      expect(schedule.data.createSchedule).toBeDefined();

      const queryForeignSchedule = await context.withSession(ADMIN_TEST_SESSION).graphql.raw({
        query: `query{     
            schedule(where: {id: "${schedule.data.createSchedule.id}" }) {
                  name
                }
              }`,
      });

      expect(queryForeignSchedule.errors).toBeUndefined();
      expect(queryForeignSchedule.data.schedule).toBeNull();

      const fact = await context.withSession(USER_TEST_SESSION).graphql.raw({
        query: `mutation {
            createFact(
              data:{
                name: "test",
                description: "test description",
                deadline: "2016-07-20T17:30:15+05:30",
                active: true,
              }
            ) {
              id
            }
          }
          `,
      });

      expect(fact.errors).toBeUndefined();
      expect(fact.data.createFact).toBeDefined();

      const queryForeignFact = await context.withSession(ADMIN_TEST_SESSION).graphql.raw({
        query: `query{     
            fact(where: {id: "${fact.data.createFact.id}" }) {
                  name
                }
              }`,
      });

      expect(queryForeignFact.errors).toBeUndefined();
      expect(queryForeignFact.data.fact).toBeNull();

      const tag = await context.withSession(USER_TEST_SESSION).graphql.raw({
        query: `mutation {
            createTag(
              data:{
                name: "test",
              }
            ) {
              id
            }
          }
          `,
      });

      expect(tag.errors).toBeUndefined();
      expect(tag.data.createTag).toBeDefined();

      const queryForeignTag = await context.withSession(ADMIN_TEST_SESSION).graphql.raw({
        query: `query{     
            tag(where: {id: "${tag.data.createTag.id}" }) {
                  name
                }
              }`,
      });

      expect(queryForeignTag.errors).toBeUndefined();
      expect(queryForeignTag.data.tag).toBeNull();
    });
  });

  describe('UPDATE', () => {
    it(
      'user update - successes when user updates own data',
      runner(async ({ context }) => {
        const firsUser = await context.withSession(undefined).graphql.raw({
          query: `mutation {
              createUser(
                data: {
                  email: "user1@email.com"
                  password: "password1234"
                }
              ) {
                id
                email
              }
            }`,
        });

        expect(firsUser.errors).toBeUndefined();
        expect(firsUser.data.createUser).toBeDefined();
        expect(firsUser.data.createUser.email).toEqual('user1@email.com');

        const secondUser = await context.withSession(undefined).graphql.raw({
          query: `mutation {
              createUser(
                data: {
                  email: "user2@email.com"
                  password: "password1234"
                }
              ) {
                id
                email
              }
            }`,
        });

        expect(secondUser.errors).toBeUndefined();
        expect(secondUser.data.createUser).toBeDefined();
        expect(secondUser.data.createUser.email).toEqual('user2@email.com');

        const { data, errors } = await context
          .withSession({
            data: {
              id: firsUser.data.createUser.id,
              isAdmin: false, // user is not admin
            },
          } as Session)
          .graphql.raw({
            query: `mutation{
            updateUser(where:{
              id:"${firsUser.data.createUser.id}"
            }, data: {
              email: "updated@email.com"
            })
            {
              email
            }
          }`,
          });

        expect(errors).toBeUndefined();
        expect(data.updateUser).toBeDefined();
        expect(data.updateUser.email).toMatch('updated@email.com');
      }),
    );

    it(
      'user update - successes when admin updates own data',
      runner(async ({ context }) => {
        const firsUser = await context.withSession(ADMIN_TEST_SESSION).graphql.raw({
          query: `mutation {
              createUser(
                data: {
                  email: "user1@email.com"
                  password: "password1234",
                  isAdmin: true
                }
              ) {
                id
                email
              }
            }`,
        });

        expect(firsUser.errors).toBeUndefined();
        expect(firsUser.data.createUser).toBeDefined();
        expect(firsUser.data.createUser.email).toEqual('user1@email.com');

        const secondUser = await context.withSession(undefined).graphql.raw({
          query: `mutation {
              createUser(
                data: {
                  email: "user2@email.com"
                  password: "password1234"
                }
              ) {
                id
                email
              }
            }`,
        });

        expect(secondUser.errors).toBeUndefined();
        expect(secondUser.data.createUser).toBeDefined();
        expect(secondUser.data.createUser.email).toEqual('user2@email.com');

        const { data, errors } = await context
          .withSession({
            data: {
              id: firsUser.data.createUser.id,
              isAdmin: true, // user is admin
            },
          } as Session)
          .graphql.raw({
            query: `mutation{
            updateUser(where:{
              id:"${firsUser.data.createUser.id}"
            }, data: {
              email: "updated@email.com"
            })
            {
              email
            }
          }`,
          });

        expect(errors).toBeUndefined();
        expect(data.updateUser).toBeDefined();
        expect(data.updateUser.email).toMatch('updated@email.com');
      }),
    );

    it(
      'user update - successes when admin updates foreign data',
      runner(async ({ context }) => {
        const firsUser = await context.withSession(ADMIN_TEST_SESSION).graphql.raw({
          query: `mutation {
              createUser(
                data: {
                  email: "user1@email.com"
                  password: "password1234"
                  isAdmin: true
                }
              ) {
                id
                email
              }
            }`,
        });

        expect(firsUser.errors).toBeUndefined();
        expect(firsUser.data.createUser).toBeDefined();
        expect(firsUser.data.createUser.email).toEqual('user1@email.com');

        const secondUser = await context.withSession(undefined).graphql.raw({
          query: `mutation {
              createUser(
                data: {
                  email: "user2@email.com"
                  password: "password1234"
                }
              ) {
                id
                email
              }
            }`,
        });

        expect(secondUser.errors).toBeUndefined();
        expect(secondUser.data.createUser).toBeDefined();
        expect(secondUser.data.createUser.email).toEqual('user2@email.com');

        const { data, errors } = await context
          .withSession({
            data: {
              id: firsUser.data.createUser.id,
              isAdmin: true, // user is admin
            },
          } as Session)
          .graphql.raw({
            query: `mutation{
            updateUser(where:{
              id:"${secondUser.data.createUser.id}"
            }, data: {
              email: "updated@email.com"
            })
            {
              email
            }
          }`,
          });

        expect(errors).toBeUndefined();
        expect(data.updateUser).toBeDefined();
        expect(data.updateUser.email).toMatch('updated@email.com');
      }),
    );

    it(
      'user update - fails when user updates foreign data',
      runner(async ({ context }) => {
        const firsUser = await context.withSession(undefined).graphql.raw({
          query: `mutation {
              createUser(
                data: {
                  email: "user1@email.com"
                  password: "password1234"
                }
              ) {
                id
                email
              }
            }`,
        });

        expect(firsUser.errors).toBeUndefined();
        expect(firsUser.data.createUser).toBeDefined();
        expect(firsUser.data.createUser.email).toEqual('user1@email.com');

        const secondUser = await context.withSession(undefined).graphql.raw({
          query: `mutation {
              createUser(
                data: {
                  email: "user2@email.com"
                  password: "password1234",
                }
              ) {
                id
                email
              }
            }`,
        });

        expect(secondUser.errors).toBeUndefined();
        expect(secondUser.data.createUser).toBeDefined();
        expect(secondUser.data.createUser.email).toEqual('user2@email.com');

        const { data, errors } = await context
          .withSession({
            data: {
              id: firsUser.data.createUser.id,
              isAdmin: false, //user is not admin
            },
          } as Session)
          .graphql.raw({
            query: `mutation{
            updateUser(where:{
              id:"${secondUser.data.createUser.id}"
            }, data: {
              email: "updated@email.com"
            })
            {
              email
            }
          }`,
          });

        expect(data.updateUser).toBeNull();
        expect(errors).toHaveLength(1);
        expect(errors[0].path).toEqual(['updateUser']);
        expect(errors[0].message).toMatch("Access denied: You cannot perform the 'update' operation on the item");
      }),
    );
  });
});
