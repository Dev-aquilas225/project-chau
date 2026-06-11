import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-6 w-6 animate-spin text-muted', className)} aria-label="Chargement" />;
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
