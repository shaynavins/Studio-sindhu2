import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Customer } from "@shared/schema";
import { OrderForm } from "@/components/order-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewOrder() {
  const [, setLocation] = useLocation();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      setSelectedCustomer(customer || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [selectedCustomerId, customers]);

  const handleOrderSubmit = () => {
    // Redirect to customers page or show success message
    setLocation("/customers");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation('/customers')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold">New Order</h1>
          <p className="text-muted-foreground mt-1">Select a customer and create a new order</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-customer">Search Customer</Label>
            <Input
              id="search-customer"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-customer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="select-customer">Customer</Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
              >
                <SelectTrigger id="select-customer" data-testid="select-customer">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCustomers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No customers found
                    </div>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedCustomer && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Selected Customer:</h4>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Name:</span> {selectedCustomer.name}</div>
                <div><span className="font-medium">Phone:</span> {selectedCustomer.phone}</div>
                {selectedCustomer.email && (
                  <div><span className="font-medium">Email:</span> {selectedCustomer.email}</div>
                )}
                {selectedCustomer.address && (
                  <div><span className="font-medium">Address:</span> {selectedCustomer.address}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCustomer && (
        <OrderForm
          customerPhone={selectedCustomer.phone}
          onSubmit={handleOrderSubmit}
        />
      )}

      {!selectedCustomer && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please select a customer to create an order
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
