import { Edit, SimpleForm } from 'react-admin';
import { PromotionForm } from './PromotionForm';

export function PromotionEdit() {
  return (
    <Edit>
      <SimpleForm>
        <PromotionForm />
      </SimpleForm>
    </Edit>
  );
}
