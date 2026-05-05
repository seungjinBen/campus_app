import { z } from 'zod';
import { TraitKey } from '@/lib/types/api.types';

export const traitEntrySchema = z.object({
  traitKey: z.custom<TraitKey>(),
  traitValue: z.string(),
  isVisible: z.boolean(),
});

export const traitsSchema = z
  .array(traitEntrySchema)
  .min(1, '특징을 1개 이상 입력해 주세요');

export type TraitEntry = z.infer<typeof traitEntrySchema>;
