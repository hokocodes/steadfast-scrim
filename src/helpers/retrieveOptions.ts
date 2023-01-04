import { CacheType, CommandInteractionOption } from 'discord.js';
import { z, ZodObject, ZodRawShape } from 'zod';

export const formatErrors = (errors: z.ZodFormattedError<Map<string, string>, string>) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && '_errors' in value) return `${name}: ${value._errors.join(', ')}\n`;
    })
    .filter(Boolean)
    .join('\n');

export const retrieveOptions = <T extends ZodRawShape>(
  inter: readonly CommandInteractionOption<CacheType>[],
  schema: ZodObject<T>
) => {
  const input: Record<string, unknown> = {};
  for (const cmdArgs of inter) {
    for (const opt of cmdArgs.options || []) {
      input[opt.name] = opt.value;
    }
  }
  return schema.safeParse(input);
};
