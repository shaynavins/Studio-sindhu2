import { useState } from "react";
import { CustomerForm } from "@/components/customer-form";
import { MeasurementForm } from "@/components/measurement-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";

export default function NewCustomer() {
  const [, setLocation] = useLocation();
  const [customerId] = useState("new-customer-id");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">New Customer Entry</h1>
        <p className="text-muted-foreground mt-1">Add customer information, photos, and measurements</p>
      </div>

      <Tabs defaultValue="customer" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="customer" data-testid="tab-customer-info">Customer Info</TabsTrigger>
          <TabsTrigger value="measurements" data-testid="tab-measurements">Measurements</TabsTrigger>
        </TabsList>

        <TabsContent value="customer" className="mt-6">
          <CustomerForm
            onSubmit={(data, images) => {
              console.log('Customer saved:', data, 'Images:', images);
              setLocation('/customers');
            }}
          />
        </TabsContent>

        <TabsContent value="measurements" className="mt-6">
          <MeasurementForm
            customerId={customerId}
            onSubmit={(data) => {
              console.log('Measurements saved:', data);
              setLocation('/customers');
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
