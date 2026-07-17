import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn } from '@/lib/utils';
import { useCurrencyStore, type Currency, CURRENCY_SYMBOLS } from '@/stores/currencyStore';

export function CurrencySelector() {
  const currentCurrency = useCurrencyStore((s) => s.currentCurrency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  const selectCurrency = (curr: Currency) => {
    setCurrency(curr);
    setOpen(false);
  };

  const currencies: Currency[] = ['EUR', 'USD', 'GBP', 'CAD'];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-1 text-sm font-medium hover:text-ink transition"
        onClick={() => setOpen((v) => !v)}
      >
        {currentCurrency} ({CURRENCY_SYMBOLS[currentCurrency]})
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-32 rounded-lg border border-line bg-paper shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {currencies.map((curr) => (
            <button
              key={curr}
              type="button"
              onClick={() => selectCurrency(curr)}
              className={cn(
                'block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition',
                curr === currentCurrency && 'font-semibold text-ink bg-gray-50/50',
              )}
            >
              {curr} ({CURRENCY_SYMBOLS[curr]})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
