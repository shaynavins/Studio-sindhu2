import { useState } from "react";
import { CustomerForm } from "@/components/customer-form";
import { MeasurementForm } from "@/components/measurement-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertCustomer } from "@shared/schema";

export default function NewCustomer() {
  const [, setLocation] = useLocation();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("customer");
  const { toast } = useToast();

  const createCustomerMutation = useMutation({
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

      const response = await fetch('/api/customers', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setCustomerId(data.id);
      toast({
        title: "Customer created",
        description: "Customer has been created. You can now add measurements.",
      });
      setActiveTab("measurements");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  const saveMeasurementsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/customers/${customerId}/measurements`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Measurements saved",
        description: "Measurements have been saved to Google Sheets.",
      });
      setLocation('/customers');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save measurements",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">New Customer Entry</h1>
        <p className="text-muted-foreground mt-1">Add customer information, photos, and measurements</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="customer" data-testid="tab-customer-info">Customer Info</TabsTrigger>
          <TabsTrigger 
            value="measurements" 
            disabled={!customerId}
            data-testid="tab-measurements"
          >
            Measurements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customer" className="mt-6">
          <CustomerForm
            onSubmit={(customerData, images) => {
              createCustomerMutation.mutate({ customerData, images });
            }}
          />
        </TabsContent>

        <TabsContent value="measurements" className="mt-6">
          {customerId && (
            <MeasurementForm
              customerId={customerId}
              onSubmit={(data) => {
                saveMeasurementsMutation.mutate(data);
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
