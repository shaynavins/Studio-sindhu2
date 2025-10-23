import { useState } from "react";
import { CustomerCard } from "@/components/customer-card";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Customers() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const allCustomers = [
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
    {
      id: "4",
      name: "Sarah Johnson",
      phone: "+1 234-567-8903",
      orderStatus: "new" as const,
      lastUpdated: "5 days ago",
    },
    {
      id: "5",
      name: "David Lee",
      phone: "+1 234-567-8904",
      orderStatus: "cutting" as const,
      lastUpdated: "1 week ago",
    },
    {
      id: "6",
      name: "Lisa Chen",
      phone: "+1 234-567-8905",
      orderStatus: "delivered" as const,
      lastUpdated: "2 weeks ago",
    },
  ];

  const filteredCustomers = allCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || customer.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New Order</SelectItem>
            <SelectItem value="measuring">Measuring</SelectItem>
            <SelectItem value="cutting">Cutting</SelectItem>
            <SelectItem value="stitching">Stitching</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredCustomers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Try adjusting your search or filter criteria, or add a new customer to get started."
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
              {...customer}
              onView={() => console.log('View customer:', customer.id)}
              onEdit={() => setLocation('/new-customer')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
