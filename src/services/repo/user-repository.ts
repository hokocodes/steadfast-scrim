import { Prisma, PrismaClient } from '@prisma/client';
import { User, mapToUser } from '../../entities/user';

export interface UserRepository {
  upsertUser: (payload: User) => Promise<User>;
  getUserByID: (id: User['id']) => Promise<User | undefined>;
  getUsers: (filter?: Prisma.UserWhereInput) => Promise<User[]>;
}

export const initUserRepository = (prisma: PrismaClient) => {
  const repo: UserRepository = {
    upsertUser: async (payload) => {
      const { id, rank, server, roles, elo, external_elo, leagueIGN } = payload;
      const user = await prisma.user.upsert({
        where: { id: payload.id },
        create: {
          id,
          league_ign: leagueIGN,
          rank,
          server,
          roles
        },
        update: {
          league_ign: leagueIGN,
          elo: elo,
          external_elo: external_elo,
          rank,
          server,
          roles
        }
      });
      return mapToUser(user);
    },
    getUserByID: async (id) => {
      const user = await prisma.user.findUnique({ where: { id } });
      return user ? mapToUser(user) : undefined;
    },
    getUsers: async (filter) => {
      const users = await prisma.user.findMany({ where: filter });
      return users.map(mapToUser);
    }
  };
  return repo;
};
