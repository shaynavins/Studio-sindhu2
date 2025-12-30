import { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MeasurementHistory {
  orderNumber: string;
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

interface OrderFormData {
  customerPhone: string;
  garmentType: string;
  status: string;
  notes?: string;
  deliveryDate?: Date;
  measurementOption: "new" | "existing";
  existingMeasurementId?: string;
  measurements?: {
    chest?: string;
    waist?: string;
    hips?: string;
    shoulder?: string;
    sleeves?: string;
    length?: string;
    inseam?: string;
    notes?: string;
  };
}

interface OrderFormProps {
  customerPhone?: string;
  onSubmit?: (data: OrderFormData) => void;
}

export function OrderForm({ customerPhone: initialPhone, onSubmit }: OrderFormProps) {
  const [measurementOption, setMeasurementOption] = useState<"new" | "existing">("new");
  const [measurementHistory, setMeasurementHistory] = useState<MeasurementHistory[]>([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<OrderFormData>({
    defaultValues: {
      customerPhone: initialPhone || "",
      garmentType: "",
      status: "new",
      notes: "",
      measurementOption: "new",
      measurements: {
        chest: "",
        waist: "",
        hips: "",
        shoulder: "",
        sleeves: "",
        length: "",
        inseam: "",
        notes: "",
      },
    },
  });

  const phone = form.watch("customerPhone");

  useEffect(() => {
    if (phone) {
      fetchMeasurementHistory(phone);
    }
  }, [phone]);

  const fetchMeasurementHistory = async (phoneNumber: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/measurements/history/${phoneNumber}`);
      if (response.ok) {
        const data = await response.json();
        setMeasurementHistory(data);
      }
    } catch (error) {
      console.error("Error fetching measurement history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMeasurementSelect = (orderNumber: string) => {
    const measurement = measurementHistory.find((m) => m.orderNumber === orderNumber);
    if (measurement) {
      setSelectedMeasurement(measurement);
      form.setValue("measurements", {
        chest: measurement.chest,
        waist: measurement.waist,
        hips: measurement.hips,
        shoulder: measurement.shoulder,
        sleeves: measurement.sleeves,
        length: measurement.length,
        inseam: measurement.inseam,
        notes: measurement.notes,
      });
      form.setValue("garmentType", measurement.garmentType);
    }
  };

  const handleSubmit = async (data: OrderFormData) => {
    try {
      const payload = {
        customerPhone: data.customerPhone,
        garmentType: data.garmentType,
        status: data.status,
        notes: data.notes,
        deliveryDate: data.deliveryDate,
        measurements: measurementOption === "new" ? data.measurements : selectedMeasurement,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Order created",
          description: "Order has been created successfully.",
        });
        onSubmit?.(data);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to create order",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234-567-8900" {...field} data-testid="input-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="garmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garment Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-garment-type">
                        <SelectValue placeholder="Select garment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="normal_blouse">Normal Blouse</SelectItem>
                      <SelectItem value="normal_blouse_pp">Normal Blouse with PP</SelectItem>
                      <SelectItem value="princess_blouse">Princess Blouse</SelectItem>
                      <SelectItem value="princess_blouse_pp">Princess Blouse with PP</SelectItem>
                      <SelectItem value="embroidery">Embroidery</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Delivery Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special instructions..."
                      className="resize-none"
                      rows={3}
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

        <Card>
          <CardHeader>
            <CardTitle>Measurements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={measurementOption}
              onValueChange={(value) => setMeasurementOption(value as "new" | "existing")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new">Create New Measurements</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" />
                <Label htmlFor="existing">Reuse Existing Measurements</Label>
              </div>
            </RadioGroup>

            {measurementOption === "existing" && measurementHistory.length > 0 && (
              <Select onValueChange={handleMeasurementSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select previous measurements" />
                </SelectTrigger>
                <SelectContent>
                  {measurementHistory.map((m) => (
                    <SelectItem key={m.orderNumber} value={m.orderNumber}>
                      {m.orderNumber} - {m.garmentType} ({m.chest ? `Chest: ${m.chest}` : "No measurements"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {measurementOption === "existing" && measurementHistory.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground">No previous measurements found for this customer.</p>
            )}

            {measurementOption === "new" && (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="measurements.chest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chest (inches)</FormLabel>
                      <FormControl>
                        <Input placeholder="38" type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements.waist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waist (inches)</FormLabel>
                      <FormControl>
                        <Input placeholder="32" type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements.hips"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hips (inches)</FormLabel>
                      <FormControl>
                        <Input placeholder="36" type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements.shoulder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shoulder (inches)</FormLabel>
                      <FormControl>
                        <Input placeholder="17" type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements.sleeves"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleeves (inches)</FormLabel>
                      <FormControl>
                        <Input placeholder="25" type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements.length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length (inches)</FormLabel>
                      <FormControl>
                        <Input placeholder="28" type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements.inseam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inseam (inches)</FormLabel>
                      <FormControl>
                        <Input placeholder="30" type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {measurementOption === "existing" && selectedMeasurement && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Selected Measurements:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedMeasurement.chest && <div>Chest: {selectedMeasurement.chest}"</div>}
                  {selectedMeasurement.waist && <div>Waist: {selectedMeasurement.waist}"</div>}
                  {selectedMeasurement.hips && <div>Hips: {selectedMeasurement.hips}"</div>}
                  {selectedMeasurement.shoulder && <div>Shoulder: {selectedMeasurement.shoulder}"</div>}
                  {selectedMeasurement.sleeves && <div>Sleeves: {selectedMeasurement.sleeves}"</div>}
                  {selectedMeasurement.length && <div>Length: {selectedMeasurement.length}"</div>}
                  {selectedMeasurement.inseam && <div>Inseam: {selectedMeasurement.inseam}"</div>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" data-testid="button-create-order">
            Create Order
          </Button>
          <Button type="button" variant="outline" data-testid="button-cancel">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
