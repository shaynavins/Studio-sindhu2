import { MeasurementForm } from "@/components/measurement-form";
import { useToast } from "@/hooks/use-toast";

export default function TestMeasurements() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Test Measurements Form</h1>
        <p className="text-muted-foreground mt-1">
          This is a test page to view and test the measurement form with new date fields
        </p>
      </div>

      <MeasurementForm
        customerId="test-customer-id"
        onSubmit={(data) => {
          console.log("Measurement form submitted:", data);
          toast({
            title: "Form Data Logged",
            description: "Check the browser console to see the submitted data",
          });
        }}
      />
    </div>
  );
}
