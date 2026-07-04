import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  const { t } = useTranslation('common');
  return <Loader2 className={cn('h-6 w-6 animate-spin text-muted', className)} aria-label={t('loading')} />;
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
