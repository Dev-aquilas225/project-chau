import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { registerSchema, type RegisterInput } from './schemas';
import { registerWithEmail } from './api';
import { useAuth } from './AuthProvider';
import { apiErrorMessage } from '@/lib/utils';

export function RegisterPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (d: RegisterInput) => {
    setBusy(true);
    try {
      await registerWithEmail(d.email, d.password, d.displayName);
      await refresh();
      toast.success('Compte créé. Bienvenue !');
      navigate('/');
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-app max-w-md py-10">
      <h1 className="mb-6 text-3xl">Créer un compte</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input className="input" placeholder="Nom complet" data-testid="name" {...register('displayName')} />
          {errors.displayName && <p className="mt-1 text-xs text-sale">{errors.displayName.message}</p>}
        </div>
        <div>
          <input className="input" type="email" placeholder="Email" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-sale">{errors.email.message}</p>}
        </div>
        <div>
          <input className="input" type="password" placeholder="Mot de passe" {...register('password')} />
          {errors.password && <p className="mt-1 text-xs text-sale">{errors.password.message}</p>}
        </div>
        <button className="btn-primary w-full" disabled={busy} data-testid="submit-register">S'inscrire</button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Déjà un compte ?{' '}
        <Link to="/login" className="font-medium text-ink underline">Se connecter</Link>
      </p>
    </div>
  );
}
