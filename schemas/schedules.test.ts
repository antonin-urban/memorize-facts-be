import { setupTestRunner } from '@keystone-6/core/testing';
import { Session } from '../auth';
import config from '../keystone';
import { ScheduleType, ScheduleParameters } from './schedule';

const runner = setupTestRunner({ config });

describe('Schedule GraphQL tests', () => {
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

  it('Create schedule for correct input', async () => {
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
    'ScheduleParameters is invalid',
    runner(async ({ context }) => {
      // Create user without the required `name` field
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
      expect(errors[0].message).toMatch('schemaPath: #/properties/interval/minimum, error: should be >= 10');
    }),
  );

  it(
    'ScheduleParameters is invalid for NOTIFY_AT: missing notifyTimes',
    runner(async ({ context }) => {
      // Create user without the required `name` field
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
    'ScheduleParameters is invalid for NOTIFY_EVERY: missing interval',
    runner(async ({ context }) => {
      // Create user without the required `name` field
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
