import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Avatar, Box, Chip, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { useUploadProductImage } from '../hooks';
import { resolveImageUrl } from '@/lib/media';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const uploadMutation = useUploadProductImage();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      let currentImages = [...images];
      for (const file of acceptedFiles) {
        try {
          const result = await uploadMutation.mutateAsync(file);
          if (result?.url) {
            currentImages = [...currentImages, result.url];
            onChange(currentImages);
          }
        } catch (err) {
          console.error('Erreur lors de l’upload de l’image', err);
        }
      }
    },
    [images, onChange, uploadMutation],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'image/gif': [] },
    maxSize: 5 * 1024 * 1024,
  });

  const removeImage = (urlToRemove: string) => {
    onChange(images.filter((img) => img !== urlToRemove));
  };

  return (
    <Stack spacing={2.5}>
      {/* Zone de Drop / Upload à forte visibilité */}
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'primary.light',
          borderRadius: 3,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'rgba(99, 102, 241, 0.03)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'rgba(99, 102, 241, 0.06)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        <input {...getInputProps()} />
        {uploadMutation.isPending ? (
          <Stack alignItems="center" spacing={1.5} py={1}>
            <CircularProgress size={32} />
            <Typography variant="body2" fontWeight={600} color="primary">
              Téléversement de l'image en cours...
            </Typography>
          </Stack>
        ) : (
          <Stack alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                width: 52,
                height: 52,
                bgcolor: isDragActive ? 'primary.main' : 'primary.50',
                color: 'primary.main',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
              }}
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                Glissez-déposez vos images ici
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                ou <Box component="span" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'underline' }}>parcourez vos fichiers</Box>
              </Typography>
            </Box>
            <Typography variant="caption" color="text.disabled">
              PNG, JPG, WEBP ou GIF (Max 5 Mo par image)
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Prévisualisation des images avec badges et bouton supprimer */}
      {images.length > 0 && (
        <Box>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Images ajoutées ({images.length})
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            {images.map((url, index) => {
              const fullUrl = resolveImageUrl(url);
              return (
                <Box
                  key={`${url}-${index}`}
                  sx={{
                    position: 'relative',
                    width: 104,
                    height: 104,
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '2px solid',
                    borderColor: index === 0 ? 'primary.main' : 'divider',
                    bgcolor: 'background.paper',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scale(1.03)' },
                  }}
                >
                  <Box
                    component="img"
                    src={fullUrl}
                    alt={`Produit ${index + 1}`}
                    onError={(e) => {
                      // Fallback si l'image ne charge pas
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent && !parent.querySelector('.img-fallback')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'img-fallback';
                        fallback.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;background:#f3f4f6;color:#9ca3af;font-size:11px;text-align:center;padding:4px;';
                        fallback.innerText = 'Image introuvable';
                        parent.appendChild(fallback);
                      }
                    }}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />

                  {/* Badge Image Principale */}
                  {index === 0 && (
                    <Chip
                      label="Principale"
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        left: 4,
                        height: 18,
                        fontSize: 9,
                        fontWeight: 700,
                        bgcolor: 'primary.main',
                        color: '#fff',
                        borderRadius: 1,
                      }}
                    />
                  )}

                  {/* Bouton de suppression */}
                  <IconButton
                    size="small"
                    onClick={() => removeImage(url)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 22,
                      height: 22,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      backdropFilter: 'blur(4px)',
                      '&:hover': { bgcolor: 'error.main' },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
