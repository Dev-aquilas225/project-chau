import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useUploadProductImage } from '../hooks';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ORIGIN = API_URL.replace(/\/api\/?$/, '');

function resolveImageUrl(url: string): string {
  return url.startsWith('http') ? url : `${ORIGIN}${url}`;
}

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const uploadMutation = useUploadProductImage();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        const result = await uploadMutation.mutateAsync(file);
        onChange([...images, result.url]);
      }
    },
    [images, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'image/gif': [] },
    maxSize: 5 * 1024 * 1024,
  });

  const removeImage = (url: string) => onChange(images.filter((img) => img !== url));

  return (
    <Stack spacing={2}>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'transparent',
        }}
      >
        <input {...getInputProps()} />
        {uploadMutation.isPending ? (
          <CircularProgress size={24} />
        ) : (
          <Stack alignItems="center" spacing={1}>
            <CloudUploadOutlinedIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              Glisser-déposer des images ou cliquer pour parcourir
            </Typography>
          </Stack>
        )}
      </Box>

      {images.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1.5}>
          {images.map((url) => (
            <Box key={url} sx={{ position: 'relative', width: 96, height: 96 }}>
              <Box
                component="img"
                src={resolveImageUrl(url)}
                alt=""
                sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}
              />
              <IconButton
                size="small"
                onClick={() => removeImage(url)}
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'error.main', color: '#fff' },
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
