import { list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import { baseAccessControl } from '../utils/accessControlHelper';
import { ownerId } from '../utils/fieldsHelper';
import { addOwner } from '../utils/hooksHelper';
import { BaseItemExtended } from './interfaces';

export interface Tag extends BaseItemExtended {
  name: string;
}

export const Tag = list({
  fields: {
    name: text({ validation: { isRequired: true } }),
    ownerId,
  },
  hooks: {
    resolveInput: addOwner as any,
  },
  access: baseAccessControl,
});
