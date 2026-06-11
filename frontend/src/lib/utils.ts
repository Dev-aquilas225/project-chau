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

/** Mappe un code d'erreur FirebaseError vers un message FR lisible. */
export function firebaseErrorMessage(code?: string): string {
  const map: Record<string, string> = {
    'auth/invalid-credential': 'Email ou mot de passe incorrect.',
    'auth/invalid-email': 'Adresse email invalide.',
    'auth/user-not-found': 'Email ou mot de passe incorrect.',
    'auth/wrong-password': 'Email ou mot de passe incorrect.',
    'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
    'auth/popup-closed-by-user': 'Connexion Google annulée.',
    'permission-denied': "Vous n'avez pas les droits pour cette action.",
  };
  return map[code ?? ''] ?? "Une erreur est survenue. Réessayez.";
}
