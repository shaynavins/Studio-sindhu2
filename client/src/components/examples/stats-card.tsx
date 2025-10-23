import { StatsCard } from '../stats-card';
import { Users, ShoppingBag, Clock, CheckCircle } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Customers"
        value={142}
        icon={Users}
        description="Active customers"
        trend={{ value: "12%", isPositive: true }}
      />
      <StatsCard
        title="Active Orders"
        value={28}
        icon={ShoppingBag}
        description="In progress"
      />
      <StatsCard
        title="Pending"
        value={8}
        icon={Clock}
        description="Awaiting pickup"
      />
      <StatsCard
        title="Completed"
        value={456}
        icon={CheckCircle}
        description="This month"
      />
    </div>
  );
}
