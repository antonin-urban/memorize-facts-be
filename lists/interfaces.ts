import { BaseItem } from '@keystone-6/core/types';

export type BaseItemExtended = BaseItem & {
  ownerId: string;
  frontendId: string;
  updatedAt: Date;
  deleted: boolean;
};

export enum CUSTOM_ERROR_CODES {
  JSON_PARSE_FAIL = 'JSON_PARSE_FAIL',
  JSON_SCHEMA_VALIDATION_FAIL = 'INVALID_JSON_SCHEMA_VALIDATION',
  MISSING_JSON_PROPERTY = 'MISSING_JSON_PROPERTY',
}
