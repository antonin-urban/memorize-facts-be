import { list } from '@keystone-6/core';
import { text, timestamp, checkbox, relationship } from '@keystone-6/core/fields';
import { baseAccessControl } from '../utils/accessControlHelper';
import { deleted, ownerId, updatedAt, frontendId } from '../utils/fieldsHelper';
import { addDeleted, addOwner } from '../utils/hooksHelper';
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
  graphql: {
    description: 'Facts can be created by logged users. Logged users can create/update/delete only own facts.',
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    description: text({ validation: { isRequired: true } }),
    deadline: timestamp(),
    active: checkbox({ access: { update: passDeadlineUpdateRestriction as any } }),
    schedules: relationship({ ref: 'Schedule', many: true }), //many to many
    tags: relationship({ ref: 'Tag', many: true }), //many to many
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
