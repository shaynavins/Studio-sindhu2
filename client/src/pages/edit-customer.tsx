import { useState } from "react";
import { CustomerForm } from "@/components/customer-form";
import { MeasurementForm } from "@/components/measurement-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useRoute } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertCustomer, Customer } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditCustomer() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/edit-customer/:id");
  const customerId = params?.id;
  const [activeTab, setActiveTab] = useState("customer");
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const { toast } = useToast();

  // Fetch customer data
  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ['/api/customers', customerId],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) throw new Error('Failed to fetch customer');
      return response.json();
    },
    enabled: !!customerId,
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async (data: { customerData: InsertCustomer; images: File[] }) => {
      const formData = new FormData();
      Object.entries(data.customerData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      data.images.forEach(image => {
        formData.append('images', image);
      });

      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update customer');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers', customerId] });
      toast({
        title: "Customer updated",
        description: "Customer information has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer",
        variant: "destructive",
      });
    },
  });

  const saveMeasurementsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', `/api/customers/${customerId}/measurements`, data);
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Item added",
        description: "Measurement entry has been saved to Google Sheets.",
      });
      // Add to saved items list for display
      setSavedItems(prev => [...prev, variables]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save measurements",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Customer not found</h1>
        <Button onClick={() => setLocation('/customers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

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
          <h1 className="text-3xl font-semibold">Edit Customer</h1>
          <p className="text-muted-foreground mt-1">Update customer information and add measurement entries</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="customer" data-testid="tab-customer-info">Customer Info</TabsTrigger>
          <TabsTrigger value="measurements" data-testid="tab-measurements">
            Measurements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customer" className="mt-6">
          <CustomerForm
            initialData={customer}
            onSubmit={(customerData, images) => {
              updateCustomerMutation.mutate({ customerData, images });
            }}
          />
        </TabsContent>

        <TabsContent value="measurements" className="mt-6">
          <div className="space-y-6">
            {savedItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Added Items ({savedItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {savedItems.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{item.item || 'Unnamed Item'}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.garmentType} - Added to sheet
                          </p>
                        </div>
                        <div className="text-sm text-green-600">✓ Saved</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <MeasurementForm
              customerId={customerId!}
              onSubmit={(data) => {
                saveMeasurementsMutation.mutate(data);
              }}
              allowMultiple={true}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
