import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import i18n from './i18n';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const INTL_LOCALE: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  es: 'es-ES',
  de: 'de-DE',
  it: 'it-IT',
};

function currentLocale(): string {
  return INTL_LOCALE[i18n.language] ?? 'fr-FR';
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat(currentLocale(), { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatDate(date?: Date | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat(currentLocale(), { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

export function getInitials(displayName: string): string {
  return displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

/** Mappe une erreur API (ApiError) vers un message localisé lisible. */
export function apiErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const status = (err as { status?: number }).status;
    if (status === 401) return i18n.t('common:errors.unauthorized');
    if (status === 403) return i18n.t('common:errors.forbidden');
    if (status === 409) return i18n.t('common:errors.conflict');
    if (err.message) return err.message;
  }
  return i18n.t('common:errors.generic');
}
