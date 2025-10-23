import { EmptyState } from '../empty-state';
import { UserPlus } from 'lucide-react';

export default function EmptyStateExample() {
  return (
    <div className="space-y-8">
      <EmptyState
        title="No customers yet"
        description="Get started by adding your first customer. You can store their information, measurements, and photos all in one place."
        action={{
          label: "Add Customer",
          onClick: () => console.log('Add customer clicked')
        }}
      />
      <EmptyState
        icon={UserPlus}
        useImage={false}
        title="No customers found"
        description="Try adjusting your search or filter criteria to find what you're looking for."
      />
    </div>
  );
}
