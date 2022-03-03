import { list } from '@keystone-6/core';
import { text, password, checkbox } from '@keystone-6/core/fields';
import { ownerOnlyAccessFilter, isUserLogged, isCurrentUserOrAdmin } from '../utils/accessControlHelper';
import { BaseItemExtended } from './interfaces';

export interface User extends Omit<BaseItemExtended, 'ownerId'> {
  email: string;
  password: string;
  isAdmin: boolean;
}

export const User = list({
  fields: {
    email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    password: password({ validation: { isRequired: true } }),
    isAdmin: checkbox({
      defaultValue: false,
      access: {
        update: () => false,
      },
    }),
  },
  access: {
    operation: {
      query: isUserLogged,
      create: isUserLogged,
    },
    item: {
      update: isCurrentUserOrAdmin,
      delete: isCurrentUserOrAdmin,
    },
    filter: {
      query: ownerOnlyAccessFilter,
    },
  },
});
