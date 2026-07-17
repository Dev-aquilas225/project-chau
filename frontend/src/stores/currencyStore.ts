import { create } from 'zustand';

export type Currency = 'EUR' | 'USD' | 'GBP' | 'CAD';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CAD: 'CA$',
};

interface CurrencyState {
  currentCurrency: Currency;
  rates: Record<Currency, number>;
  setCurrency: (currency: Currency) => void;
  fetchRates: () => Promise<void>;
  convert: (amountInEur: number) => number;
  format: (amountInEur: number) => string;
}

function readSavedCurrency(): Currency | null {
  try {
    return localStorage.getItem('currency') as Currency | null;
  } catch {
    return null;
  }
}

const savedCurrency = readSavedCurrency();
const initialCurrency: Currency = savedCurrency && ['EUR', 'USD', 'GBP', 'CAD'].includes(savedCurrency)
  ? savedCurrency
  : 'EUR';

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currentCurrency: initialCurrency,
  rates: {
    EUR: 1.0,
    USD: 1.09,
    GBP: 0.85,
    CAD: 1.48,
  },
  setCurrency: (currency: Currency) => {
    set({ currentCurrency: currency });
    try {
      localStorage.setItem('currency', currency);
    } catch {}
  },
  fetchRates: async () => {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/EUR');
      if (!res.ok) throw new Error('Failed to fetch exchange rates');
      const data = await res.json();
      if (data && data.rates) {
        set({
          rates: {
            EUR: 1.0,
            USD: data.rates.USD || 1.09,
            GBP: data.rates.GBP || 0.85,
            CAD: data.rates.CAD || 1.48,
          },
        });
      }
    } catch (err) {
      console.warn('Erreur lors du chargement des taux de change, fallbacks utilisés:', err);
    }
  },
  convert: (amountInEur: number) => {
    const { currentCurrency, rates } = get();
    const rate = rates[currentCurrency] || 1.0;
    return amountInEur * rate;
  },
  format: (amountInEur: number) => {
    const { currentCurrency, convert } = get();
    const convertedAmount = convert(amountInEur);
    const symbol = CURRENCY_SYMBOLS[currentCurrency];
    
    // Formatting depending on currency
    if (currentCurrency === 'EUR') {
      return `${convertedAmount.toFixed(2).replace('.', ',')} €`;
    } else if (currentCurrency === 'GBP') {
      return `£${convertedAmount.toFixed(2)}`;
    } else {
      return `${symbol}${convertedAmount.toFixed(2)}`;
    }
  },
}));
