import { Create, SimpleForm } from 'react-admin';
import { ProductForm } from './ProductForm';

export function ProductCreate() {
  return (
    <Create>
      <SimpleForm>
        <ProductForm />
      </SimpleForm>
    </Create>
  );
}
