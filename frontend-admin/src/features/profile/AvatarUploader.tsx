import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Avatar, Box, CircularProgress } from '@mui/material';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import { useUploadAvatar } from './hooks';
import { resolveImageUrl } from '@/lib/media';

interface AvatarUploaderProps {
  photoURL?: string | null;
  displayName?: string;
  onChange: (url: string) => void;
}

export default function AvatarUploader({ photoURL, displayName, onChange }: AvatarUploaderProps) {
  const uploadMutation = useUploadAvatar();

  const onDrop = useCallback(
    async ([file]: File[]) => {
      if (!file) return;
      const result = await uploadMutation.mutateAsync(file);
      onChange(result.url);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'image/gif': [] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        position: 'relative',
        width: 96,
        height: 96,
        borderRadius: '50%',
        cursor: 'pointer',
        '&:hover .avatar-overlay': { opacity: 1 },
      }}
    >
      <input {...getInputProps()} />
      <Avatar
        src={photoURL ? resolveImageUrl(photoURL) : undefined}
        sx={{ width: 96, height: 96, fontSize: 32, bgcolor: 'primary.main', border: isDragActive ? '2px dashed' : 'none', borderColor: 'primary.main' }}
      >
        {displayName?.[0]?.toUpperCase() ?? 'A'}
      </Avatar>
      <Box
        className="avatar-overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0,0,0,0.45)',
          color: '#fff',
          opacity: isDragActive || uploadMutation.isPending ? 1 : 0,
          transition: 'opacity 0.15s',
        }}
      >
        {uploadMutation.isPending ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : <CameraAltOutlinedIcon fontSize="small" />}
      </Box>
    </Box>
  );
}
