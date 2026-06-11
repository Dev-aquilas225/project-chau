import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { toast } from 'sonner';
import { registerSchema, type RegisterInput } from './schemas';
import { registerWithEmail, loginWithGoogle } from './api';
import { GoogleButton } from './GoogleButton';
import { firebaseErrorMessage } from '@/lib/utils';

export function RegisterPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (d: RegisterInput) => {
    setBusy(true);
    try {
      await registerWithEmail(d.email, d.password, d.displayName);
      toast.success('Compte créé. Bienvenue !');
      navigate('/');
    } catch (e) {
      toast.error(firebaseErrorMessage(e instanceof FirebaseError ? e.code : undefined));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (e) {
      toast.error(firebaseErrorMessage(e instanceof FirebaseError ? e.code : undefined));
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

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
      </div>
      <GoogleButton onClick={google} disabled={busy} />

      <p className="mt-6 text-center text-sm text-muted">
        Déjà un compte ?{' '}
        <Link to="/login" className="font-medium text-ink underline">Se connecter</Link>
      </p>
    </div>
  );
}
