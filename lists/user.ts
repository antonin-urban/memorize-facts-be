import { list } from '@keystone-6/core';
import { text, password, checkbox } from '@keystone-6/core/fields';
import {
  isAdmin,
  isUserLogged,
  isAdminOrNotLoggedUser,
  ownerOnlyAccessFilter,
  isCurrentUserOrAdmin,
} from '../utils/accessControlHelper';
import { BaseItemExtended } from './interfaces';

export interface User extends Omit<BaseItemExtended, 'ownerId'> {
  email: string;
  password: string;
  isAdmin: boolean;
}

export const User = list({
  graphql: {
    description:
      'Users can be created by admin or by NOT logged user (empty session = registration). Admin can create/update other admin users via isAdmin field. Admins cannot acces anything except data from User table.',
  },
  fields: {
    email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    password: password({ validation: { isRequired: true } }),
    isAdmin: checkbox({
      defaultValue: false,
      access: {
        update: isAdmin,
        create: isAdmin,
      },
    }),
  },
  access: {
    operation: {
      query: isUserLogged,
      create: isAdminOrNotLoggedUser,
    },
    item: {
      update: isCurrentUserOrAdmin as any,
      delete: isCurrentUserOrAdmin as any,
    },
    filter: {
      query: ownerOnlyAccessFilter,
    },
  },
});
