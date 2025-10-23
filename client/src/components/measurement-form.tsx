import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface MeasurementFormData {
  garmentType: string;
  chest?: string;
  waist?: string;
  hips?: string;
  shoulder?: string;
  sleeves?: string;
  length?: string;
  inseam?: string;
  notes?: string;
}

interface MeasurementFormProps {
  customerId: string;
  onSubmit?: (data: MeasurementFormData) => void;
}

export function MeasurementForm({ customerId, onSubmit }: MeasurementFormProps) {
  const { toast } = useToast();
  const form = useForm<MeasurementFormData>({
    defaultValues: {
      garmentType: "",
      chest: "",
      waist: "",
      hips: "",
      shoulder: "",
      sleeves: "",
      length: "",
      inseam: "",
      notes: "",
    },
  });

  const handleSubmit = (data: MeasurementFormData) => {
    onSubmit?.(data);
    toast({
      title: "Measurements saved",
      description: "Measurements have been saved to Google Sheets.",
    });
    console.log('Measurements submitted:', data, 'Customer ID:', customerId);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="garmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-garment-type">
                        <SelectValue placeholder="Select garment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="shirt">Shirt</SelectItem>
                      <SelectItem value="pants">Pants</SelectItem>
                      <SelectItem value="suit">Suit</SelectItem>
                      <SelectItem value="dress">Dress</SelectItem>
                      <SelectItem value="jacket">Jacket</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Measurements (in inches)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="chest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chest</FormLabel>
                    <FormControl>
                      <Input placeholder="38" type="number" step="0.1" {...field} data-testid="input-chest" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="waist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waist</FormLabel>
                    <FormControl>
                      <Input placeholder="32" type="number" step="0.1" {...field} data-testid="input-waist" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hips"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hips</FormLabel>
                    <FormControl>
                      <Input placeholder="36" type="number" step="0.1" {...field} data-testid="input-hips" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shoulder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shoulder</FormLabel>
                    <FormControl>
                      <Input placeholder="17" type="number" step="0.1" {...field} data-testid="input-shoulder" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sleeves"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleeves</FormLabel>
                    <FormControl>
                      <Input placeholder="25" type="number" step="0.1" {...field} data-testid="input-sleeves" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length</FormLabel>
                    <FormControl>
                      <Input placeholder="28" type="number" step="0.1" {...field} data-testid="input-length" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inseam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inseam</FormLabel>
                    <FormControl>
                      <Input placeholder="30" type="number" step="0.1" {...field} data-testid="input-inseam" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special instructions or notes..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      data-testid="input-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" data-testid="button-save-measurements">
            Save Measurements
          </Button>
          <Button type="button" variant="outline" data-testid="button-cancel-measurements">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
