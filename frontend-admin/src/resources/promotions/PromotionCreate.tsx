import { Create, SimpleForm } from 'react-admin';
import { PromotionForm } from './PromotionForm';

export function PromotionCreate() {
  return (
    <Create>
      <SimpleForm>
        <PromotionForm />
      </SimpleForm>
    </Create>
  );
}
