import { list } from '@keystone-6/core';
import { text, select, json } from '@keystone-6/core/fields';
import { baseAccessControl } from '../utils/accessControlHelper';
import { ownerId } from '../utils/fieldsHelper';
import { addOwner } from '../utils/hooksHelper';
import { BaseItemExtended } from './interfaces';

const SCHEDULE_PARAMETERS_DEFAULT: ScheduleParameters = {
  interval: 0,
  notifyTimes: ['9:00', '12:00', '18:00'],
  dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
};

export interface ScheduleParameters {
  interval: number; // in minutes
  notifyTimes: string[]; // HH:MM
  dayOfWeek: number[]; // 0-6 (0 is Monday, 6 is Sunday)
}

export interface Schedule extends BaseItemExtended {
  name: string;
  type: ScheduleType;
  scheduleParameters: ScheduleParameters;
}

export enum ScheduleType {
  NOTIFY_EVERY = 'NOTIFY_EVERY',
  NOTIFY_AT = 'NOTIFY_AT',
}

export const Schedule = list({
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
    }),
    ownerId,
  },
  hooks: {
    resolveInput: addOwner,
  },
  access: baseAccessControl,
});
