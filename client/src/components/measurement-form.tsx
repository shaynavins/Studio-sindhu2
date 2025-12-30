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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface MeasurementFormData {
  garmentType: string;
  tailor?: string;
  workshop?: string;
  tassels?: string;
  deliveryDate?: Date;
  workshopSendDate?: Date;
  tailorDeliveryDate?: Date;
  tailorPickupDate?: Date;
  workshopDeliveryDate?: Date;
  workshopPickupDate?: Date;
  tasselsDeliveryDate?: Date;
  tasselsPickupDate?: Date;
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
      tailor: "",
      workshop: "",
      tassels: "",
      deliveryDate: undefined,
      workshopSendDate: undefined,
      tailorDeliveryDate: undefined,
      tailorPickupDate: undefined,
      workshopDeliveryDate: undefined,
      workshopPickupDate: undefined,
      tasselsDeliveryDate: undefined,
      tasselsPickupDate: undefined,
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
              name="tailor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tailor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-tailor">
                        <SelectValue placeholder="Select tailor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="shahjan">Shahjan</SelectItem>
                      <SelectItem value="suraj">Suraj</SelectItem>
                      <SelectItem value="mujamal">Mujamal</SelectItem>
                      <SelectItem value="raju">Raju</SelectItem>
                      <SelectItem value="newe-raju">Newe Raju</SelectItem>
                      <SelectItem value="balram">Balram</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workshop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workshop</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-workshop">
                        <SelectValue placeholder="Select workshop" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="samulla">Samulla</SelectItem>
                      <SelectItem value="tirumala">Tirumala</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tassels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tassels</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-tassels">
                        <SelectValue placeholder="Select tassels" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="rashida">Rashida</SelectItem>
                      <SelectItem value="latha">Latha</SelectItem>
                      <SelectItem value="rathna">Rathna</SelectItem>
                      <SelectItem value="sashi">Sashi</SelectItem>
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
                  <FormLabel>Final Delivery Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="select-delivery-date"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Tailor Dates Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tailor Dates</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="tailorDeliveryDate"
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
                          data-testid="select-tailor-delivery-date"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
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
              name="tailorPickupDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Pickup Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="select-tailor-pickup-date"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Workshop Dates Section */}
        <Card>
          <CardHeader>
            <CardTitle>Workshop Dates</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="workshopDeliveryDate"
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
                          data-testid="select-workshop-delivery-date"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
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
              name="workshopPickupDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Pickup Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="select-workshop-pickup-date"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Tassels Dates Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tassels Dates</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="tasselsDeliveryDate"
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
                          data-testid="select-tassels-delivery-date"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
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
              name="tasselsPickupDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Pickup Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="select-tassels-pickup-date"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
