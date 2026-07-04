import {
  BooleanInput,
  NumberInput,
  SelectInput,
  TextInput,
  required,
} from 'react-admin';

export function ProductForm() {
  return (
    <>
      <TextInput source="name" validate={required()} fullWidth />
      <TextInput source="brand" fullWidth />
      <TextInput source="description" multiline rows={4} fullWidth />
      <NumberInput source="price" validate={required()} min={0} />
      <NumberInput source="stock" validate={required()} min={0} />
      <TextInput source="categoryId" label="ID Catégorie" />
      <SelectInput
        source="listingStatus"
        choices={[
          { id: 'draft', name: 'Brouillon' },
          { id: 'active', name: 'Actif' },
          { id: 'archived', name: 'Archivé' },
        ]}
      />
      <TextInput source="condition" />
      <TextInput source="size" />
      <TextInput source="location" />
      <BooleanInput source="active" defaultValue={true} />
      <BooleanInput source="weLove" label="Coup de cœur" defaultValue={false} />
    </>
  );
}
