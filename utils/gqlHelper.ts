import { GraphQLResolver, KeystoneContext } from '@keystone-6/core/types';
import { Tag } from '../lists/tag';

export const customTypeDefs = `
    type Query {
      feedForRxDBReplicationTag(lastFrontendId: String!, minUpdatedAt: DateTime!, limit: Int!): [Tag!]!
    }
    type Mutation {
      # the mutations get arrays of documents as input.
      setRxDBReplicationTags(tags: [TagCreateInput]): Tag # returns the last of the mutated documents
    }
    `;

export const customResolvers: Record<string, Record<string, GraphQLResolver<any>>> = {
  Query: {
    feedForRxDBReplicationTag: async (
      root,
      {
        lastFrontendId,
        minUpdatedAt,
        limit,
      }: {
        lastFrontendId: string;
        minUpdatedAt: Date;
        limit: number;
      },
      context: KeystoneContext,
    ) => {
      const documents = (await context.db.Tag.findMany({})) as Tag[];

      // sorted by updatedAt first and the id as second
      const sortedDocuments = [...documents].sort((a, b) => {
        if (a.updatedAt > b.updatedAt) return 1;
        if (a.updatedAt < b.updatedAt) return -1;
        if (a.updatedAt === b.updatedAt) {
          if (a.frontendId > b.frontendId) return 1;
          if (a.frontendId < b.frontendId) return -1;
          else return 0;
        }
      });

      // only return documents newer then the input document
      const filterForMinUpdatedAtAndId = sortedDocuments.filter((doc) => {
        if (doc.updatedAt < minUpdatedAt) return false;
        if (doc.updatedAt > minUpdatedAt) return true;
        if (doc.updatedAt === minUpdatedAt) {
          // if updatedAt is equal, compare by id
          if (doc.frontendId > lastFrontendId) return true;
          else return false;
        }
      });

      // only return some documents in one batch
      const limited = filterForMinUpdatedAtAndId.slice(0, limit);

      return limited;
    },
  },
  Mutation: {
    setRxDBReplicationTags: (root, { tags }: { tags: Tag[] }, context: KeystoneContext) => {
      let lastOne;
      tags.forEach(async (updatedTag) => {
        const found = await context.db.Tag.findOne({ where: { frontendId: updatedTag.frontendId } });
        if (found) {
          await context.db.Tag.updateOne({
            where: { frontendId: updatedTag.frontendId },
            data: { name: updatedTag.name, updatedAt: updatedTag.updatedAt, deleted: updatedTag.deleted },
          });
        } else {
          await context.db.Tag.createOne({ data: updatedTag });
        }

        lastOne = updatedTag;
      });
      // returns the last of the mutated documents
      return lastOne;
    },
  },
};
