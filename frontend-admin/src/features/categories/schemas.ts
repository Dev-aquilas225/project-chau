import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  slug: z
    .string()
    .min(1, 'Le slug est requis')
    .regex(/^[a-z0-9-]+$/, 'Slug invalide (minuscules, chiffres, tirets)'),
  parentId: z.string().nullable().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
