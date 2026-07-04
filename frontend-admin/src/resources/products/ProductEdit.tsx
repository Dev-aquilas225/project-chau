import { Edit, SimpleForm } from 'react-admin';
import { ProductForm } from './ProductForm';

export function ProductEdit() {
  return (
    <Edit>
      <SimpleForm>
        <ProductForm />
      </SimpleForm>
    </Edit>
  );
}
