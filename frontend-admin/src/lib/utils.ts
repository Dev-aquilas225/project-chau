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
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}
