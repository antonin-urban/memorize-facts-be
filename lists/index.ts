import { ListSchemaConfig } from '@keystone-6/core/types';
import { Fact } from './fact';
import { Schedule } from './schedule';
import { Tag } from './tag';
import { User } from './user';

export const lists: ListSchemaConfig = {
  User,
  Fact,
  Tag,
  Schedule,
};
