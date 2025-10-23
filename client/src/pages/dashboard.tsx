import { useState } from "react";
import { StatsCard } from "@/components/stats-card";
import { CustomerCard } from "@/components/customer-card";
import { Users, ShoppingBag, Clock, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const recentCustomers = [
    {
      id: "1",
      name: "Michael Anderson",
      phone: "+1 234-567-8900",
      orderStatus: "measuring" as const,
      lastUpdated: "2 hours ago",
    },
    {
      id: "2",
      name: "Emma Williams",
      phone: "+1 234-567-8901",
      orderStatus: "ready" as const,
      lastUpdated: "1 day ago",
    },
    {
      id: "3",
      name: "James Brown",
      phone: "+1 234-567-8902",
      orderStatus: "stitching" as const,
      lastUpdated: "3 days ago",
    },
  ];

  const filteredCustomers = recentCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your work.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Recent Customers</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
              data-testid="input-search-customers"
            />
            <Button onClick={() => setLocation("/customers")} data-testid="button-view-all">
              View All
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map(customer => (
            <CustomerCard
              key={customer.id}
              {...customer}
              onView={() => console.log('View customer:', customer.id)}
              onEdit={() => setLocation('/new-customer')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
