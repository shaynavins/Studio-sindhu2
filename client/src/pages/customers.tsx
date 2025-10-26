import { useState } from "react";
import { CustomerCard } from "@/components/customer-card";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Customer } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Customers() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery);
    return matchesSearch;
  });

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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage all your customers and their orders</p>
        </div>
        <Button onClick={() => setLocation("/new-customer")} data-testid="button-add-customer">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
          data-testid="input-search"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          title={customers.length === 0 ? "No customers yet" : "No customers found"}
          description={customers.length === 0 
            ? "Get started by adding your first customer. You can store their information, measurements, and photos all in one place."
            : "Try adjusting your search criteria, or add a new customer to get started."}
          action={{
            label: "Add Customer",
            onClick: () => setLocation("/new-customer")
          }}
        />
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
  );
}
