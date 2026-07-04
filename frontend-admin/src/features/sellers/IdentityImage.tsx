import { useEffect, useState } from 'react';
import { apiFetchBlob } from '@/lib/http';

export function IdentityImage({ filename, alt }: { filename?: string; alt: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setSrc(null);
    setError(false);
    if (!filename) return;

    let objectUrl: string | null = null;
    let cancelled = false;

    apiFetchBlob(`/uploads/identity/${filename}`)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [filename]);

  if (!filename) return <p className="text-xs text-muted">Aucun document</p>;
  if (error) return <p className="text-xs text-red-600">Échec du chargement</p>;
  if (!src) return <p className="text-xs text-muted">Chargement…</p>;

  return (
    <div className="h-32 w-28 overflow-hidden rounded border border-line">
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}
