import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatDate(date?: Date | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

/** Mappe une erreur API (ApiError) vers un message FR lisible. */
export function apiErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const status = (err as { status?: number }).status;
    if (status === 401) return 'Email ou mot de passe incorrect.';
    if (status === 403) return "Vous n'avez pas les droits pour cette action.";
    if (status === 409) return 'Cette adresse email est déjà utilisée.';
    if (err.message) return err.message;
  }
  return 'Une erreur est survenue. Réessayez.';
}
