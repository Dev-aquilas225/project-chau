import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { toast } from 'sonner';
import { loginSchema, type LoginInput } from './schemas';
import { loginWithEmail, loginWithGoogle } from './api';
import { GoogleButton } from './GoogleButton';
import { firebaseErrorMessage } from '@/lib/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const handle = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      toast.success('Connexion réussie');
      navigate(redirect);
    } catch (e) {
      toast.error(firebaseErrorMessage(e instanceof FirebaseError ? e.code : undefined));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-app max-w-md py-10">
      <h1 className="mb-6 text-3xl">Connexion</h1>
      <form onSubmit={handleSubmit((d) => handle(() => loginWithEmail(d.email, d.password)))} className="space-y-4">
        <div>
          <input className="input" type="email" placeholder="Email" data-testid="email" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-sale">{errors.email.message}</p>}
        </div>
        <div>
          <input className="input" type="password" placeholder="Mot de passe" data-testid="password" {...register('password')} />
          {errors.password && <p className="mt-1 text-xs text-sale">{errors.password.message}</p>}
        </div>
        <button className="btn-primary w-full" disabled={busy} data-testid="submit-login">Se connecter</button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
      </div>
      <GoogleButton onClick={() => handle(loginWithGoogle)} disabled={busy} />

      <p className="mt-6 text-center text-sm text-muted">
        Pas encore de compte ?{' '}
        <Link to="/register" className="font-medium text-ink underline">Créer un compte</Link>
      </p>
    </div>
  );
}
