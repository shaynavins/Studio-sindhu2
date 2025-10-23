import { CustomerCard } from '../customer-card';

export default function CustomerCardExample() {
  return (
    <div className="p-4 space-y-4 max-w-md">
      <CustomerCard
        id="1"
        name="Michael Anderson"
        phone="+1 234-567-8900"
        orderStatus="measuring"
        lastUpdated="2 hours ago"
        onView={() => console.log('View customer')}
        onEdit={() => console.log('Edit customer')}
      />
      <CustomerCard
        id="2"
        name="Emma Williams"
        phone="+1 234-567-8901"
        orderStatus="ready"
        lastUpdated="1 day ago"
        onView={() => console.log('View customer')}
        onEdit={() => console.log('Edit customer')}
      />
    </div>
  );
}
