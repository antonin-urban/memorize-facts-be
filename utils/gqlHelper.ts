import { GraphQLResolver, KeystoneContext } from '@keystone-6/core/types';
import { Tag } from '../lists/tag';
import { isUserLogged } from './accessControlHelper';

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
      if (!lastFrontendId || !minUpdatedAt || limit < 1) {
        return [];
      }

      if (!isUserLogged(context.session)) {
        return null;
      }

      const documents = (await context.query.Tag.findMany({})) as Tag[];

      if (documents.length === 0) {
        return [];
      }

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
      if (!tags) {
        return null;
      }

      if (!isUserLogged(context.session)) {
        return null;
      }

      let lastOne = null;
      Promise.all(
        tags.map(async (updatedTag) => {
          let found = null;
          const foundTags = await context.query.Tag.findMany({
            where: { frontendId: { equals: updatedTag.frontendId } },
          });

          if (foundTags && foundTags.length > 0) {
            console.error('Sync error: found mulitple tags with same id, updating the newer one', found[0]);
            found = [...(foundTags as any)].sort((x) => x.updatedAt)[0];
          } else if (foundTags && foundTags.length === 1) {
            found = foundTags[0];
          }

          if (found) {
            await context.query.Tag.updateOne({
              where: { frontendId: updatedTag.frontendId },
              data: { name: updatedTag.name, updatedAt: updatedTag.updatedAt, deleted: updatedTag.deleted },
            });
          } else {
            await context.query.Tag.createOne({ data: updatedTag });
          }

          lastOne = updatedTag;
        }),
      );
      // returns the last of the mutated documents
      return lastOne;
    },
  },
};
