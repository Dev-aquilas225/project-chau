import { useEffect } from 'react';
import { AppRoutes } from './routes/AppRoutes';
import { useCurrencyStore } from './stores/currencyStore';

export default function App() {
  const fetchRates = useCurrencyStore((s) => s.fetchRates);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return <AppRoutes />;
}
