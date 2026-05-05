import { z } from 'zod';
import { TraitKey } from '@/lib/types/api.types';

export const idealEntrySchema = z.object({
  traitKey: z.custom<TraitKey>(),
  traitValue: z.string().nullable(),
});

export const idealSchema = z.array(idealEntrySchema);

export type IdealEntry = z.infer<typeof idealEntrySchema>;
