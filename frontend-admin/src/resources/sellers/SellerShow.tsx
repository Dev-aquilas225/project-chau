import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { EmailField, Labeled, Show, SimpleShowLayout, TextField, useRecordContext } from 'react-admin';
import { AuthenticatedImageField } from '../../components/AuthenticatedImageField';
import { StatusBadge } from '../../components/StatusBadge';
import type { UserProfile } from '../../types';
import { SellerApproveRejectButtons } from './SellerActions';

function SellerIdentityDocuments() {
  const record = useRecordContext<UserProfile>();
  if (!record) return null;
  const profile = record.sellerProfile;

  return (
    <Stack direction="row" spacing={2} flexWrap="wrap">
      <Box>
        <Typography variant="caption" color="text.secondary">
          Pièce d'identité (recto)
        </Typography>
        <AuthenticatedImageField filename={profile?.idDocumentRef} alt="Pièce d'identité recto" />
      </Box>
      {profile?.idType === 'national_id' && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Pièce d'identité (verso)
          </Typography>
          <AuthenticatedImageField filename={profile?.idDocumentBackRef} alt="Pièce d'identité verso" />
        </Box>
      )}
      <Box>
        <Typography variant="caption" color="text.secondary">
          Photo de profil
        </Typography>
        <AuthenticatedImageField filename={profile?.profilePhotoRef} alt="Photo de profil" />
      </Box>
    </Stack>
  );
}

function SellerShowActions() {
  const record = useRecordContext<UserProfile>();
  if (!record) return null;
  return (
    <Box sx={{ mt: 2 }}>
      <SellerApproveRejectButtons record={record} />
    </Box>
  );
}

export function SellerShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="displayName" label="Nom" />
        <EmailField source="email" />
        <Labeled label="Statut">
          <FunctionFieldStatus />
        </Labeled>
        <TextField source="sellerProfile.storeName" label="Nom de la boutique" />
        <TextField source="sellerProfile.bio" label="Description" />
        <TextField source="sellerProfile.fullNameOnId" label="Nom sur la pièce d'identité" />
        <TextField source="sellerProfile.idCountry" label="Pays de la pièce d'identité" />
        <SellerIdentityDocuments />
        <SellerShowActions />
      </SimpleShowLayout>
    </Show>
  );
}

function FunctionFieldStatus() {
  const record = useRecordContext<UserProfile>();
  if (!record) return null;
  return <StatusBadge status={record.sellerStatus ?? 'none'} />;
}
