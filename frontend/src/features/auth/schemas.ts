import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Au moins 6 caractères'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  displayName: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Au moins 6 caractères'),
});
export type RegisterInput = z.infer<typeof registerSchema>;
