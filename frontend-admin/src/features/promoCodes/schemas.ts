import { z } from 'zod';

export const promoCodeSchema = z.object({
  code: z.string().min(1, 'Le code est requis').toUpperCase(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().min(0, 'La valeur doit être positive'),
  minAmount: z.coerce.number().min(0).optional(),
  expiresAt: z.string().optional(),
  active: z.boolean(),
});

export type PromoCodeFormValues = z.infer<typeof promoCodeSchema>;
