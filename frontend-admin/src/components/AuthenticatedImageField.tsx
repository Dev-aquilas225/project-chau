import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { apiFetchBlob } from '../dataProvider/httpClient';

/**
 * `/uploads/identity/:filename` requires a Bearer token, so a plain
 * react-admin `<ImageField>` (which renders `<img src={record[source]}>`)
 * cannot load it directly — fetch the blob with auth and use an object URL.
 */
export function AuthenticatedImageField({ filename, alt }: { filename?: string; alt: string }) {
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

  if (!filename) return <Typography variant="caption" color="text.secondary">Aucun document</Typography>;
  if (error) return <Typography variant="caption" color="error">Échec du chargement</Typography>;
  if (!src) return <Skeleton variant="rounded" width={112} height={128} />;

  return (
    <Box sx={{ width: 112, height: 128, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </Box>
  );
}
