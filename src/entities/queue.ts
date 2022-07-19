import { z } from 'zod';
import { Queuer as PrismaQueuer } from '@prisma/client';
import { regionEnum, userSchema } from './user';

export const queuerSchema = z.object({
  userID: z.string(),
  popped: z.boolean(),
  queuedAt: z.date()
});

export const queueSchema = z.object({
  guildID: z.string(),
  region: regionEnum,
  inQueue: z.array(userSchema)
});

export type Queuer = z.infer<typeof queuerSchema>;
export type Queue = z.infer<typeof queueSchema>;

// todo: fix any here
export const mapToQueuer = (dbQueuer: PrismaQueuer) =>
  queuerSchema.parse({
    userID: dbQueuer.user_id,
    popped: dbQueuer.popped,
    queuedAt: dbQueuer.queued_at
  });
