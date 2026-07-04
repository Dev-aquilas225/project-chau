import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getRegisterSchema, type RegisterInput } from './schemas';
import { registerWithEmail } from './api';
import { useAuth } from './AuthProvider';
import { apiErrorMessage } from '@/lib/utils';

export function RegisterPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({ resolver: zodResolver(getRegisterSchema(t)) });

  const onSubmit = async (d: RegisterInput) => {
    setBusy(true);
    try {
      await registerWithEmail(d.email, d.password, d.displayName);
      await refresh();
      toast.success(t('register.successToast'));
      navigate('/');
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-app max-w-md py-10">
      <h1 className="mb-6 text-3xl">{t('register.title')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input className="input" placeholder={t('register.namePlaceholder')} data-testid="name" {...register('displayName')} />
          {errors.displayName && <p className="mt-1 text-xs text-sale">{errors.displayName.message}</p>}
        </div>
        <div>
          <input className="input" type="email" placeholder={t('register.emailPlaceholder')} {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-sale">{errors.email.message}</p>}
        </div>
        <div>
          <input className="input" type="password" placeholder={t('register.passwordPlaceholder')} {...register('password')} />
          {errors.password && <p className="mt-1 text-xs text-sale">{errors.password.message}</p>}
        </div>
        <button className="btn-primary w-full" disabled={busy} data-testid="submit-register">{t('register.submit')}</button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {t('register.hasAccount')}{' '}
        <Link to="/login" className="font-medium text-ink underline">{t('register.login')}</Link>
      </p>
    </div>
  );
}
