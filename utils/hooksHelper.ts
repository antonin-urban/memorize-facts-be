import { KeystoneContext } from '@keystone-6/core/types';
import { Session } from '../auth';
import { BaseItemExtended } from '../schemas/interfaces';

/**
 * Adds ownerId to the item from session
 */
export const addOwner = ({ resolvedData, context }: { resolvedData: BaseItemExtended; context: KeystoneContext }) => {
  if (context) {
    const session = context.session as Session;
    if (session.data?.id) {
      resolvedData.ownerId = session.data.id;
    }
  }
  return resolvedData;
};
