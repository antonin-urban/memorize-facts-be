import { BaseItem, BaseListTypeInfo, KeystoneContext, KeystoneContextFromListTypeInfo } from '@keystone-6/core/types';
import { Session } from '../auth';
import { BaseItemExtended } from '../lists/interfaces';

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

export const addDeleted = async ({
  operation,
  listKey,
  originalItem,
  context,
}: {
  operation: string;
  listKey: string;
  originalItem: BaseItem;
  context: KeystoneContextFromListTypeInfo<BaseListTypeInfo>;
}) => {
  if (operation === 'delete') {
    const deletedData = JSON.stringify({
      ...originalItem,
      id: undefined,
      ownerId: undefined,
      updatedAt: undefined,
      deleted: true,
    });
    await context.db[listKey].createOne({
      data: {
        ...JSON.parse(deletedData),
      },
    });
  }
};
