import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getLoginSchema, type LoginInput } from './schemas';
import { loginWithEmail } from './api';
import { useAuth } from './AuthProvider';
import { apiErrorMessage } from '@/lib/utils';

export function LoginPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({ resolver: zodResolver(getLoginSchema(t)) });

  const onSubmit = async (d: LoginInput) => {
    setBusy(true);
    try {
      await loginWithEmail(d.email, d.password);
      await refresh();
      toast.success(t('login.successToast'));
      navigate(redirect);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-app max-w-md py-10">
      <h1 className="mb-6 text-3xl">{t('login.title')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input className="input" type="email" placeholder={t('login.emailPlaceholder')} data-testid="email" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-sale">{errors.email.message}</p>}
        </div>
        <div>
          <input className="input" type="password" placeholder={t('login.passwordPlaceholder')} data-testid="password" {...register('password')} />
          {errors.password && <p className="mt-1 text-xs text-sale">{errors.password.message}</p>}
        </div>
        <button className="btn-primary w-full" disabled={busy} data-testid="submit-login">{t('login.submit')}</button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {t('login.noAccount')}{' '}
        <Link to="/register" className="font-medium text-ink underline">{t('login.createAccount')}</Link>
      </p>
    </div>
  );
}
