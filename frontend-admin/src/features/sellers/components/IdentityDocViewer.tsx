import { useEffect, useState } from 'react';
import { Box, CircularProgress, Dialog, Typography } from '@mui/material';
import { apiFetchBlobUrl } from '@/lib/http';

interface IdentityDocViewerProps {
  label: string;
  filename?: string;
}

export default function IdentityDocViewer({ label, filename }: IdentityDocViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!filename) return;
    let objectUrl: string | null = null;
    let cancelled = false;

    apiFetchBlobUrl(`/uploads/identity/${filename}`)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setBlobUrl(url);
      })
      .catch(() => setError(true));

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [filename]);

  if (!filename) {
    return (
      <Box sx={{ width: 160, height: 110, border: '1px dashed', borderColor: 'divider', borderRadius: 1.5 }} />
    );
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Box
        onClick={() => blobUrl && setOpen(true)}
        sx={{
          width: 160,
          height: 110,
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: blobUrl ? 'pointer' : 'default',
          bgcolor: 'action.hover',
        }}
      >
        {error && (
          <Typography variant="caption" color="error">
            Introuvable
          </Typography>
        )}
        {!error && !blobUrl && <CircularProgress size={20} />}
        {blobUrl && (
          <Box component="img" src={blobUrl} alt={label} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
        {blobUrl && <Box component="img" src={blobUrl} alt={label} sx={{ maxWidth: '100%', display: 'block' }} />}
      </Dialog>
    </Box>
  );
}
