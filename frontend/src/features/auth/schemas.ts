import { z } from 'zod';
import type { TFunction } from 'i18next';

export function getLoginSchema(t: TFunction) {
  return z.object({
    email: z.string().email(t('errors.emailInvalid')),
    password: z.string().min(6, t('errors.passwordTooShort')),
  });
}
export type LoginInput = z.infer<ReturnType<typeof getLoginSchema>>;

export function getRegisterSchema(t: TFunction) {
  return z.object({
    displayName: z.string().min(2, t('errors.nameTooShort')),
    email: z.string().email(t('errors.emailInvalid')),
    password: z.string().min(6, t('errors.passwordTooShort')),
  });
}
export type RegisterInput = z.infer<ReturnType<typeof getRegisterSchema>>;
