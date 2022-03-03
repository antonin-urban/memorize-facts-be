import { list } from '@keystone-6/core';
import { text, timestamp, checkbox, relationship } from '@keystone-6/core/fields';
import { baseAccessControl } from '../utils/accessControlHelper';
import { ownerId } from '../utils/fieldsHelper';
import { addOwner } from '../utils/hooksHelper';
import { BaseItemExtended } from './interfaces';

export interface Fact extends BaseItemExtended {
  name: string;
  description: string;
  deadline?: Date;
  active: boolean;
}

const passDeadlineUpdateRestriction = ({ item }: { item: Fact }) => {
  if (item?.deadline?.valueOf() < Date.now().valueOf()) {
    return false;
  }
  return true;
};

export const Fact = list({
  fields: {
    name: text({ validation: { isRequired: true } }),
    description: text({ validation: { isRequired: true } }),
    deadline: timestamp(),
    active: checkbox({ access: { update: passDeadlineUpdateRestriction } }),
    schedules: relationship({ ref: 'Schedule', many: true }), //many to many
    tags: relationship({ ref: 'Tag', many: true }), //many to many
    ownerId,
  },
  hooks: {
    resolveInput: addOwner,
  },
  access: baseAccessControl,
});
