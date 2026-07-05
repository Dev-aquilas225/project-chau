import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

export function formatDate(value: string | Date): string {
  return dayjs(value).format('DD/MM/YYYY HH:mm');
}

export function formatDateShort(value: string | Date): string {
  return dayjs(value).format('DD/MM/YYYY');
}
