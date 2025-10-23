import { MeasurementForm } from '../measurement-form';

export default function MeasurementFormExample() {
  return (
    <div className="p-6 max-w-2xl">
      <MeasurementForm
        customerId="customer-123"
        onSubmit={(data) => {
          console.log('Measurements saved:', data);
        }}
      />
    </div>
  );
}
