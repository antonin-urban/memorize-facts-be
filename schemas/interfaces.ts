import { BaseItem } from '@keystone-6/core/types';

export type BaseItemExtended = BaseItem & {
  ownerId: string;
};
