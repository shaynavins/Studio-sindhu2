import { StatsCard } from "@/components/stats-card";
import { CustomerCard } from "@/components/customer-card";
import { Users, ShoppingBag, Clock, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Customer } from "@shared/schema";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const recentCustomers = customers
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const filteredCustomers = recentCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your work.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Customers"
          value={customers.length}
          icon={Users}
          description="Active customers"
        />
        <StatsCard
          title="Active Orders"
          value={0}
          icon={ShoppingBag}
          description="In progress"
        />
        <StatsCard
          title="Pending"
          value={0}
          icon={Clock}
          description="Awaiting pickup"
        />
        <StatsCard
          title="Completed"
          value={0}
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

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map(customer => (
              <CustomerCard
                key={customer.id}
                id={customer.id}
                name={customer.name}
                phone={customer.phone}
                orderStatus="new"
                lastUpdated={getTimeAgo(customer.updatedAt)}
                onView={() => setLocation(`/customer/${customer.id}`)}
                onEdit={() => setLocation(`/edit-customer/${customer.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
