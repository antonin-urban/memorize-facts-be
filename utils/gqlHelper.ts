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
    ): Promise<Tag[]> => {
      try {
        console.log('incoming feedForRxDBReplicationTag...');

        if ((!lastFrontendId && lastFrontendId !== '') || !minUpdatedAt || limit < 1) {
          console.error('Sync feedForRxDBReplicationTag error: invalid parameters', {
            lastFrontendId,
            minUpdatedAt,
            limit,
          });
          throw new Error('Invalid parameters');
        }

        const documents = (await context.db.Tag.findMany({}).catch((e) => {
          console.error('Sync feedForRxDBReplicationTag error: could not find tags', e);
          throw e;
        })) as Tag[];

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

        if (!sortedDocuments) {
          return [];
        }

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
      } catch (e) {
        console.error('Sync feedForRxDBReplicationTag error', e);
        throw e;
      }
    },
  },
  Mutation: {
    setRxDBReplicationTags: async (root, { tags }: { tags: Tag[] }, context: KeystoneContext): Promise<Tag> => {
      try {
        console.log('incoming setRxDBReplicationTags...');

        if (!tags) {
          console.error('Sync setRxDBReplicationTags error: invalid parameters', { tags });
          throw new Error('Invalid parameters');
        }

        let lastOne: Tag = null;
        await Promise.all(
          tags.map(async (updatedTag) => {
            let found: Tag = null;

            const foundTags = await context.db.Tag.findMany({
              where: {
                frontendId: { equals: updatedTag.frontendId },
              },
            }).catch((e) => {
              console.error('Sync setRxDBReplicationTags error: could not find tag', e);
              return;
            });

            if (foundTags && foundTags.length > 1) {
              found = [...(foundTags as Tag[])].sort((x) => x.updatedAt?.getTime())[0];
              await Promise.all(
                foundTags.map(async (tag: Tag) => {
                  if (tag.id.toString() !== found.id.toString() && !tag.deleted) {
                    console.warn(
                      'Sync setRxDBReplicationTags warning: found mulitple tags with same frontend id, updating the newer one, deleting the older one',
                      tag,
                    );
                    await context.db.Tag.deleteOne({ where: { id: tag.id.toString() } });
                  }
                }),
              );
            } else if (foundTags && foundTags.length === 1) {
              found = foundTags[0] as Tag;
            }

            if (found) {
              await context.query.Tag.updateOne({
                where: { id: found.id.toString() },
                data: {
                  name: updatedTag.name,
                  deleted: updatedTag.deleted,
                },
              }).catch((e) => {
                console.error('Sync error: could not update tag', e);
                lastOne = { ...updatedTag, id: found.id };
                return;
              });

              lastOne = { ...updatedTag, id: found.id };
            } else {
              const inserted = (await context.query.Tag.createOne({
                data: {
                  frontendId: updatedTag.frontendId,
                  name: updatedTag.name,
                  deleted: updatedTag.deleted,
                },
              }).catch((e) => {
                console.error('Sync error: could not create tag', e);
                lastOne = { ...updatedTag, id: found.id };
                return;
              })) as Tag;

              if (inserted?.id?.toString()) {
                lastOne = { ...updatedTag, id: inserted.id.toString() };
              }
            }
          }),
        );
        // returns the last of the mutated documents
        return lastOne;
      } catch (e) {
        console.error('Sync setRxDBReplicationTags error:', e);
        throw e;
      }
    },
  },
};
