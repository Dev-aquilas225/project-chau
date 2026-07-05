import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  brand: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Le prix doit être positif'),
  categoryId: z.string().optional(),
  stock: z.coerce.number().min(0, 'Le stock doit être positif'),
  condition: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  active: z.boolean(),
  weLove: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
