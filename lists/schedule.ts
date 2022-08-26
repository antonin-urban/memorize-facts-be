import { list } from '@keystone-6/core';
import { text, select, json } from '@keystone-6/core/fields';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { baseAccessControl } from '../utils/accessControlHelper';
import { deleted, frontendId, ownerId, updatedAt } from '../utils/fieldsHelper';
import { addDeleted, addOwner } from '../utils/hooksHelper';
import { formatOutput } from '../utils/utils';
import { BaseItemExtended, CUSTOM_ERROR_CODES } from './interfaces';

const SCHEDULE_PARAMETERS_DEFAULT: ScheduleParameters = {
  interval: 10,
  notifyTimes: ['08:00:00+00:00', '12:00:00+00:00', '16:00:00+00:00'],
  dayOfWeek: [true, true, true, true, true, true, true],
};

const ajv = new Ajv();
addFormats(ajv);

const scheduleParametersJsonSchema: object = {
  type: 'object',
  properties: {
    interval: { type: 'integer', multipleOf: 10, minimum: 10 },
    notifyTimes: {
      type: 'array',
      items: {
        type: 'string',
        format: 'time',
        minItems: 1,
      },
    },
    dayOfWeek: {
      type: 'array',
      items: {
        type: 'boolean',
      },
      minItems: 7,
      maxItems: 7,
    },
  },
  required: ['dayOfWeek'],
  additionalProperties: false,
};

export interface ScheduleParameters {
  interval: number; // in minutes
  notifyTimes: string[]; // HH:MM
  dayOfWeek: boolean[]; // 7 (0 is Monday, 6 is Sunday; true is include, false is exclude)
}

export interface Schedule extends BaseItemExtended {
  name: string;
  type: ScheduleType;
  scheduleParameters: ScheduleParameters;
  deleted: boolean;
  frontendId: string;
  updatedAt: Date;
}

export enum ScheduleType {
  NOTIFY_EVERY = 'NOTIFY_EVERY',
  NOTIFY_AT = 'NOTIFY_AT',
}

export const Schedule = list({
  graphql: {
    description:
      'Schedules used to notify users about facts. Schedules can be created by logged users. Logged users can create/update/delete only own schedules.',
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    type: select({
      type: 'enum',
      options: ['NOTIFY_EVERY', 'NOTIFY_AT'],
      validation: { isRequired: true },
      defaultValue: 'NOTIFY_EVERY',
    }),
    scheduleParameters: json({
      defaultValue: {
        ...SCHEDULE_PARAMETERS_DEFAULT,
      },
      hooks: {
        validateInput: async ({ item, resolvedData, addValidationError }) => {
          if (!resolvedData.scheduleParameters) {
            return;
          }

          const currentDbSchedule = item as Schedule;

          let scheduleParametersObject: ScheduleParameters;
          try {
            scheduleParametersObject = resolvedData.scheduleParameters;
          } catch (jsonParseError) {
            addValidationError(formatOutput(CUSTOM_ERROR_CODES.JSON_PARSE_FAIL, jsonParseError.message));
            return;
          }

          try {
            const validateFunction = ajv.compile(scheduleParametersJsonSchema);
            const jsonSchemaValidationResult = validateFunction(scheduleParametersObject);

            if (!jsonSchemaValidationResult) {
              addValidationError(
                formatOutput(
                  CUSTOM_ERROR_CODES.JSON_SCHEMA_VALIDATION_FAIL,
                  ...validateFunction.errors.map((x) => `schemaPath: ${x.schemaPath}, error: ${x.message}`),
                ),
              );
              return;
            }
          } catch (error) {
            addValidationError(formatOutput(CUSTOM_ERROR_CODES.JSON_SCHEMA_VALIDATION_FAIL, error.message));
            return;
          }

          if (
            (!resolvedData.type &&
              currentDbSchedule.type === ScheduleType.NOTIFY_EVERY &&
              !scheduleParametersObject.interval) ||
            (resolvedData.type && resolvedData.type === ScheduleType.NOTIFY_EVERY && !scheduleParametersObject.interval)
          ) {
            addValidationError(formatOutput(CUSTOM_ERROR_CODES.MISSING_JSON_PROPERTY, 'interval'));
            return;
          }

          if (
            (!resolvedData.type &&
              currentDbSchedule.type === ScheduleType.NOTIFY_AT &&
              !scheduleParametersObject.notifyTimes) ||
            (resolvedData.type && resolvedData.type === ScheduleType.NOTIFY_AT && !scheduleParametersObject.notifyTimes)
          ) {
            addValidationError(formatOutput(CUSTOM_ERROR_CODES.MISSING_JSON_PROPERTY, 'notifyTimes'));
            return;
          }
        },
      },
    }),
    ownerId,
    deleted,
    updatedAt,
    frontendId,
  },
  hooks: {
    resolveInput: addOwner as any,
    afterOperation: addDeleted,
  },
  access: baseAccessControl,
});
