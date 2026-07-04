import { BooleanInput, DateInput, NumberInput, SelectInput, TextInput, required } from 'react-admin';

export function PromotionForm() {
  return (
    <>
      <TextInput source="code" validate={required()} />
      <SelectInput
        source="discountType"
        validate={required()}
        choices={[
          { id: 'percentage', name: 'Pourcentage' },
          { id: 'fixed', name: 'Montant fixe' },
        ]}
      />
      <NumberInput source="discountValue" validate={required()} min={0} />
      <NumberInput source="minAmount" min={0} defaultValue={0} />
      <DateInput source="expiresAt" />
      <BooleanInput source="active" defaultValue={true} />
    </>
  );
}
