import { ListAccessControl, BaseListTypeInfo } from '@keystone-6/core/types';
import { Session } from '../auth';
import { BaseItemExtended } from '../schemas/interfaces';
import { User } from '../schemas/user';

/**
 * Validate there is an user logged in
 */
export const isUserLogged = ({ session }: { session: Session }) => (session?.data?.id ? true : false);

/**
 * Validate the current user is an admin
 */
export const isAdmin = ({ session }: { session: Session }) => session?.data.isAdmin;

/**
 * Validate the current user is updating its own data
 */
export const isCurrentUserData = ({ session, item }: { session: Session; item: BaseItemExtended }) => {
  return session?.data?.id === item?.ownerId;
};

/**
 * Validate the current user is updating itself
 */
export const isCurrentUserOrAdmin = ({ session, item }: { session: Session; item: User }) => {
  console.debug('isCurrentUserOrAdmin', { session, item });
  console.debug(session?.data.isAdmin);
  return session?.data.isAdmin || session?.data?.id === item.id;
};

/**
 * Restrict all CRUD operations
 */
export const restrictAll = {
  operation: {
    query: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
};

/**
 * Restrict everything from CRUD except read (query) operation
 */
export const readOnly = {
  operation: {
    query: () => true,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
};

export const ownerOnlyAccessFilter = ({ session, listKey }: { session: Session; listKey: string }) => {
  if (listKey === 'User') {
    if (!session.data.isAdmin) {
      return {
        id: { equals: session.data.id },
      };
    }
    return true; // return all users
  }

  return {
    ownerId: { equals: session.data.id },
  };
};

export const baseAccessControl: ListAccessControl<BaseListTypeInfo> = {
  operation: {
    query: isUserLogged,
    create: isUserLogged,
  },
  item: {
    update: isCurrentUserData,
    delete: isCurrentUserData,
  },
  filter: {
    query: ownerOnlyAccessFilter,
  },
};
