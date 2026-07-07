import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: Array<number | 'ellipsis'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push('ellipsis');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);

  return pages;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const { t } = useTranslation('catalog');
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav className="mt-8 flex items-center justify-center gap-6 text-sm" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 font-medium disabled:cursor-not-allowed disabled:text-muted disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('catalog.pagination.previous')}
      </button>

      <div className="flex items-center gap-3">
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'min-w-[1.5rem] text-center',
                p === page ? 'font-bold underline underline-offset-4' : 'text-muted hover:text-ink',
              )}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 font-medium disabled:cursor-not-allowed disabled:text-muted disabled:opacity-50"
      >
        {t('catalog.pagination.next')}
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
