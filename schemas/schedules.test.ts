import { setupTestEnv, setupTestRunner, TestEnv } from '@keystone-6/core/testing';
import { KeystoneContext } from '@keystone-6/core/types';
import { Session } from '../auth';
import config from '../keystone';
import { ScheduleType, ScheduleParameters } from './schedule';

const runner = setupTestRunner({ config });

describe('Schedule validations tests', () => {
  const SCHEDULE_PARAMETERS: ScheduleParameters = {
    interval: 0,
    notifyTimes: ['08:00:00+00:00', '12:00:00+00:00', '16:00:00+00:00'],

    dayOfWeek: [true, true, true, true, true, true, true],
  };

  const SCHEDULE = {
    name: 'Test Schedule',
    type: ScheduleType.NOTIFY_AT,
    scheduleParameters: SCHEDULE_PARAMETERS,
  };

  const TEST_SESSION: Session = {
    data: {
      id: 'test-session-id',
      isAdmin: false,
    },
  };

  it('creates schedule with correct input', async () => {
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: `mutation {
          createSchedule(
            data: {
              name: ${SCHEDULE.name},
              type: ${SCHEDULE.type},
              scheduleParameters: ${SCHEDULE.scheduleParameters}
            }
          ) {
            name
            type
            scheduleParameters
          }
        }`,
      }).expect(200);
      const schedule = body.data.createSchedule;
      expect(schedule.name).toEqual(SCHEDULE.name);
      expect(schedule.type).toEqual(SCHEDULE.type);
      expect(schedule.scheduleParameters).toEqual(SCHEDULE.scheduleParameters);
    });
  });

  it(
    'fails if scheduleParameters is invalid',
    runner(async ({ context }) => {
      const { data, errors } = await context.withSession(TEST_SESSION).graphql.raw({
        query: `mutation {
          createSchedule(
            data: {
              name: "${SCHEDULE.name}"
              type: ${ScheduleType.NOTIFY_AT},
              scheduleParameters: {
                interval: 3,
                dayOfWeek: [true, true, true, true, true, true, true]
              }
            }
          ) {
            name
            type
            scheduleParameters
          }
        }`,
      });

      expect(data.createSchedule).toBeNull();
      expect(errors).toHaveLength(1);
      expect(errors[0].path).toEqual(['createSchedule']);
      expect(errors[0].message).toMatch('schemaPath: #/properties/interval/minimum, error: must be >= 10');
    }),
  );

  it(
    'fails if scheduleParameters is invalid for NOTIFY_AT: missing notifyTimes',
    runner(async ({ context }) => {
      const { data, errors } = await context.withSession(TEST_SESSION).graphql.raw({
        query: `mutation {
          createSchedule(
            data: {
              name: "${SCHEDULE.name}",
              type: ${ScheduleType.NOTIFY_AT},
              scheduleParameters: {
                interval: 10,
                dayOfWeek: [true, true, true, true, true, true, true]
              }
            }
          ) {
            name
            type
            scheduleParameters
          }
        }`,
      });

      expect(data.createSchedule).toBeNull();
      expect(errors).toHaveLength(1);
      expect(errors[0].path).toEqual(['createSchedule']);
      expect(errors[0].message).toMatch('MISSING_JSON_PROPERTY | notifyTimes');
    }),
  );

  it(
    'fails if scheduleParameters is invalid for NOTIFY_EVERY: missing interval',
    runner(async ({ context }) => {
      const { data, errors } = await context.withSession(TEST_SESSION).graphql.raw({
        query: `mutation {
          createSchedule(
            data: {
              name: "${SCHEDULE.name}",
              type: ${ScheduleType.NOTIFY_EVERY},
              scheduleParameters: { 
                dayOfWeek: [true, true, true, true, true, true, true]
              }
            }
          ) {
            name
            type
            scheduleParameters
          }
        }`,
      });

      expect(data.createSchedule).toBe(null);
      expect(errors).toHaveLength(1);
      expect(errors[0].path).toEqual(['createSchedule']);
      expect(errors[0].message).toEqual(
        'You provided invalid data for this operation.\n  - Schedule.scheduleParameters: MISSING_JSON_PROPERTY | interval',
      );
    }),
  );
});

describe('Schedule access control test', () => {
  const TEST_SESSION_FAKE_ID = 'test-session-id';
  const OTHER_TEST_SESSION_FAKE_ID = 'other-test-session-id';

  const TEST_SESSION: Session = {
    data: {
      id: TEST_SESSION_FAKE_ID,
      isAdmin: false,
    },
  };

  const OTHER_TEST_SESSION: Session = {
    data: {
      id: OTHER_TEST_SESSION_FAKE_ID,
      isAdmin: false,
    },
  };

  describe('CREATE', () => {
    it(
      'successes when there is session',
      runner(async ({ context }) => {
        const { data, errors } = await context.withSession(TEST_SESSION).graphql.raw({
          query: `mutation {
            createSchedule(
              data: {
                name: "test"
                type: ${ScheduleType.NOTIFY_EVERY},
                scheduleParameters: {
                  interval: 10,
                  dayOfWeek: [true, true, true, true, true, true, true]
                }
              }
            ) {
              name
              type
              scheduleParameters
            }
          }`,
        });

        expect(errors).toBeUndefined();
        expect(data.createSchedule).toBeDefined();
      }),
    );

    it(
      'fails when session is missing',
      runner(async ({ context }) => {
        const { data, errors } = await context.withSession(undefined).graphql.raw({
          query: `mutation {
            createSchedule(
              data: {
                name: "test"
                type: ${ScheduleType.NOTIFY_EVERY},
                scheduleParameters: {
                  interval: 10,
                  dayOfWeek: [true, true, true, true, true, true, true]
                }
              }
            ) {
              name
              type
              scheduleParameters
            }
          }`,
        });

        expect(data.createSchedule).toBeNull();
        expect(errors).toHaveLength(1);
        expect(errors[0].path).toEqual(['createSchedule']);
        expect(errors[0].message).toMatch("Access denied: You cannot perform the 'create' operation on the list");
      }),
    );
  });

  describe('READ & UPDATE', () => {
    let testEnv: TestEnv;
    let context: KeystoneContext;
    let itemId: string;
    let otherItemId: string;

    beforeAll(async () => {
      testEnv = await setupTestEnv({ config });
      context = testEnv.testArgs.context;

      await testEnv.connect();

      let result = await context.withSession(TEST_SESSION).query.Schedule.createOne({
        data: {
          name: TEST_SESSION_FAKE_ID,
          type: ScheduleType.NOTIFY_AT,
          scheduleParameters: {
            interval: 10,
            notifyTimes: ['08:00:00+00:00', '12:00:00+00:00', '16:00:00+00:00'],
            dayOfWeek: [true, true, true, true, true, true, true],
          },
        },
        query: 'id',
      });

      itemId = result.id;

      result = await context.withSession(OTHER_TEST_SESSION).query.Schedule.createOne({
        data: {
          name: OTHER_TEST_SESSION_FAKE_ID,
          type: ScheduleType.NOTIFY_AT,
          scheduleParameters: {
            interval: 10,
            notifyTimes: ['08:00:00+00:00', '12:00:00+00:00', '16:00:00+00:00'],
            dayOfWeek: [true, true, true, true, true, true, true],
          },
        },
        query: 'id',
      });

      otherItemId = result.id;
    });

    afterAll(async () => {
      await testEnv.disconnect();
    });

    it('returns only owners data', async () => {
      const { data, errors } = await context.withSession(TEST_SESSION).graphql.raw({
        query: `query{     
              schedules {
                name
              }
            }`,
      });

      expect(errors).toBeUndefined();
      expect(data.schedules).toBeDefined();
      expect(data.schedules).toHaveLength(1);
      expect(data.schedules[0].name).toEqual(TEST_SESSION_FAKE_ID);
    });

    it('returns [] when sessions is empty', async () => {
      const { data, errors } = await context.withSession(undefined).graphql.raw({
        query: `query{     
            schedules {
              name
            }
          }`,
      });

      expect(errors).toBeUndefined();
      expect(data.schedules).toHaveLength(0);
    });

    it('returns null if user request foreign data', async () => {
      const { data, errors } = await context.withSession(TEST_SESSION).graphql.raw({
        query: `query{     
              schedule(where:{id:"${otherItemId}"}) {
                name
              }
            }`,
      });

      expect(errors).toBeUndefined();
      expect(data.schedule).toBeNull();
    });

    it('updates owners data', async () => {
      const { data, errors } = await context.withSession(TEST_SESSION).graphql.raw({
        query: `mutation{
            updateSchedule(where:{
              id:"${itemId}"
            }, data: {
              type: ${ScheduleType.NOTIFY_EVERY}
            })
            {
              id
              type
            }
          }`,
      });

      expect(errors).toBeUndefined();
      expect(data.updateSchedule).toBeDefined();
      expect(data.updateSchedule.id).toEqual(itemId);
      expect(data.updateSchedule.type).toEqual(ScheduleType.NOTIFY_EVERY);
    });

    it('fails to update foreign data', async () => {
      const { data, errors } = await context.withSession(TEST_SESSION).graphql.raw({
        query: `mutation{
            updateSchedule(where:{
              id:"${otherItemId}"
            }, data: {
              type: ${ScheduleType.NOTIFY_EVERY}
            })
            {
              id
              type
            }
          }`,
      });

      expect(data.updateSchedule).toBeNull();
      expect(errors).toHaveLength(1);
      expect(errors[0].path).toEqual(['updateSchedule']);
      expect(errors[0].message).toMatch("Access denied: You cannot perform the 'update' operation on the item");
    });
  });

  describe('DELETE', () => {
    let testEnv: TestEnv;
    let context: KeystoneContext;
    let itemId: string;
    let otherItemId: string;

    beforeAll(async () => {
      testEnv = await setupTestEnv({ config });
      context = testEnv.testArgs.context;

      await testEnv.connect();

      let result = await context.withSession(TEST_SESSION).query.Schedule.createOne({
        data: {
          name: TEST_SESSION_FAKE_ID,
          type: ScheduleType.NOTIFY_AT,
          scheduleParameters: {
            interval: 10,
            notifyTimes: ['08:00:00+00:00', '12:00:00+00:00', '16:00:00+00:00'],
            dayOfWeek: [true, true, true, true, true, true, true],
          },
        },
        query: 'id',
      });

      itemId = result.id;

      result = await context.withSession(OTHER_TEST_SESSION).query.Schedule.createOne({
        data: {
          name: OTHER_TEST_SESSION_FAKE_ID,
          type: ScheduleType.NOTIFY_AT,
          scheduleParameters: {
            interval: 10,
            notifyTimes: ['08:00:00+00:00', '12:00:00+00:00', '16:00:00+00:00'],
            dayOfWeek: [true, true, true, true, true, true, true],
          },
        },
        query: 'id',
      });

      otherItemId = result.id;
    });

    afterAll(async () => {
      await testEnv.disconnect();
    });

    it('deletes owners data', async () => {
      const { data, errors } = await context.withSession(TEST_SESSION).graphql.raw({
        query: `mutation{
            deleteSchedule(where:{
              id:"${itemId}"
            })
            {
              id
            }
          }`,
      });

      expect(errors).toBeUndefined();
      expect(data.deleteSchedule).toBeDefined();
      expect(data.deleteSchedule.id).toEqual(itemId);
    });

    it('fails to delete foreign data', async () => {
      const { data, errors } = await context.withSession(TEST_SESSION).graphql.raw({
        query: `mutation{
          deleteSchedule(where:{
            id:"${otherItemId}"
          })
          {
            id
          }
        }`,
      });

      expect(data.deleteSchedule).toBeNull();
      expect(errors).toHaveLength(1);
      expect(errors[0].path).toEqual(['deleteSchedule']);
      expect(errors[0].message).toMatch("Access denied: You cannot perform the 'delete' operation on the item");
    });
  });
});
