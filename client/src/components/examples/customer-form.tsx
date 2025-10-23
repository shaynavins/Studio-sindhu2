import { CustomerForm } from '../customer-form';

export default function CustomerFormExample() {
  return (
    <div className="p-6 max-w-2xl">
      <CustomerForm
        onSubmit={(data, images) => {
          console.log('Customer data:', data);
          console.log('Images uploaded:', images.length);
        }}
      />
    </div>
  );
}
