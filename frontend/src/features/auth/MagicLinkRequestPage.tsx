import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getMagicLinkSchema, type MagicLinkInput } from './schemas';
import { requestMagicLink } from './api';
import { apiErrorMessage } from '@/lib/utils';

export function MagicLinkRequestPage() {
  const { t } = useTranslation('auth');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<MagicLinkInput>({
    resolver: zodResolver(getMagicLinkSchema(t)),
  });

  const onSubmit = async (d: MagicLinkInput) => {
    setBusy(true);
    try {
      await requestMagicLink(d.email);
      setSent(true);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="container-app max-w-md py-16 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="mb-3 text-2xl font-semibold">{t('magicLink.sentTitle')}</h1>
        <p className="text-sm text-muted">{t('magicLink.sentText')}</p>
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-ink underline">
          {t('magicLink.backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app max-w-md py-10">
      <h1 className="mb-2 text-3xl">{t('magicLink.title')}</h1>
      <p className="mb-6 text-sm text-muted">{t('magicLink.subtitle')}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            type="email"
            placeholder={t('login.emailPlaceholder')}
            data-testid="magic-link-email"
            {...register('email')}
          />
        </div>
        {errors.email && <p className="mt-1 text-xs text-sale">{errors.email.message}</p>}
        <button className="btn-primary w-full" disabled={busy} data-testid="submit-magic-link">
          {t('magicLink.submit')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link to="/login" className="font-medium text-ink underline">{t('magicLink.backToLogin')}</Link>
      </p>
    </div>
  );
}
