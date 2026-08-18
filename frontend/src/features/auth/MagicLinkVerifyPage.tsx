import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { verifyMagicLink } from './api';
import { useAuth } from './AuthProvider';
import { apiErrorMessage } from '@/lib/utils';

export function MagicLinkVerifyPage() {
  const { t } = useTranslation('auth');
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);
  // Le jeton est à usage unique côté serveur : StrictMode/re-render ne doit pas
  // déclencher un second appel qui échouerait inutilement sur un jeton déjà consommé.
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;

    (async () => {
      try {
        await verifyMagicLink(token);
        await refresh();
        toast.success(t('login.successToast'));
        navigate('/', { replace: true });
      } catch (e) {
        setError(apiErrorMessage(e));
      }
    })();
  }, [token, navigate, refresh, t]);

  if (error) {
    return (
      <div className="container-app max-w-md py-16 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <XCircle className="h-7 w-7 text-red-600" />
        </div>
        <h1 className="mb-3 text-2xl font-semibold">{t('magicLink.errorTitle')}</h1>
        <p className="text-sm text-muted">{error}</p>
        <Link to="/connexion-lien" className="mt-6 inline-block text-sm font-medium text-ink underline">
          {t('magicLink.requestNewLink')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app flex max-w-md flex-col items-center py-20 text-center">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted" />
      <p className="text-sm text-muted">{t('magicLink.verifying')}</p>
    </div>
  );
}
