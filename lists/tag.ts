import { list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import { baseAccessControl } from '../utils/accessControlHelper';
import { ownerId, deleted, updatedAt, frontendId } from '../utils/fieldsHelper';
import { addDeleted, addOwner } from '../utils/hooksHelper';
import { BaseItemExtended } from './interfaces';

export interface Tag extends BaseItemExtended {
  name: string;
}

export const Tag = list({
  graphql: {
    description:
      'Tags used to categorize facts. Tags can be created logged users. Logged users can create/update/delete only own tags.',
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
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
