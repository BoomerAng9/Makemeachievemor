import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Truck, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";

const availabilitySchema = z.object({
  isAvailable: z.boolean().default(true),
  preferredLocations: z.array(z.object({
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required"),
    radius: z.number().min(10).max(200, "Radius must be between 10-200 miles")
  })).min(1, "At least one preferred location required").max(3, "Maximum 3 locations allowed"),
  serviceRadius: z.number().min(25).max(200, "Service radius must be between 25-200 miles"),
  maxDistance: z.number().min(100).max(500, "Max distance must be between 100-500 miles"),
  deadMileLimit: z.number().min(10).max(100, "Dead mile limit must be between 10-100 miles"),
  equipmentTypes: z.array(z.string()).min(1, "Select at least one equipment type"),
  minRate: z.number().min(1, "Minimum rate is required"),
  specialServices: z.array(z.string()).optional(),
  notes: z.string().optional()
});

type AvailabilityFormData = z.infer<typeof availabilitySchema>;

interface ContractorAvailabilitySetupProps {
  contractorId: number;
  onComplete: () => void;
}

const EQUIPMENT_TYPES = [
  "Dry Van",
  "Refrigerated", 
  "Flatbed",
  "Step Deck",
  "Lowboy",
  "Box Truck",
  "Cargo Van",
  "Tanker",
  "Car Hauler",
  "Dump Truck"
];

const SPECIAL_SERVICES = [
  "Expedited Delivery",
  "White Glove Service", 
  "Hazmat Certified",
  "Temperature Controlled",
  "Oversized Loads",
  "Team Driving",
  "Cross Docking",
  "Warehousing",
  "Last Mile Delivery",
  "Dedicated Routes"
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export function ContractorAvailabilitySetup({ contractorId, onComplete }: ContractorAvailabilitySetupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      isAvailable: true,
      preferredLocations: [{ city: "", state: "", radius: 50 }],
      serviceRadius: 50,
      maxDistance: 200,
      deadMileLimit: 50,
      equipmentTypes: [],
      minRate: 2.0,
      specialServices: [],
      notes: ""
    }
  });

  const createAvailabilityMutation = useMutation({
    mutationFn: async (data: AvailabilityFormData) => {
      return apiRequest("POST", "/api/contractor/availability", {
        contractorId,
        ...data
      });
    },
    onSuccess: () => {
      toast({
        title: "Availability Setup Complete",
        description: "Your availability preferences have been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contractor/availability"] });
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to save availability preferences",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: AvailabilityFormData) => {
    createAvailabilityMutation.mutate(data);
  };

  const addLocation = () => {
    const current = form.getValues("preferredLocations");
    if (current.length < 3) {
      form.setValue("preferredLocations", [...current, { city: "", state: "", radius: 50 }]);
    }
  };

  const removeLocation = (index: number) => {
    const current = form.getValues("preferredLocations");
    if (current.length > 1) {
      form.setValue("preferredLocations", current.filter((_, i) => i !== index));
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Service Locations</h3>
        <p className="text-gray-600">Set your preferred service areas and travel limits</p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Commitment Policy:</strong> We have zero tolerance for ghosting or inconsistent availability. 
          Your commitment score affects job opportunities and platform fees.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="preferredLocations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Service Locations (Max 3)</FormLabel>
              <div className="space-y-3">
                {field.value.map((location, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="City"
                        value={location.city}
                        onChange={(e) => {
                          const updated = [...field.value];
                          updated[index].city = e.target.value;
                          field.onChange(updated);
                        }}
                      />
                    </div>
                    <div className="w-20">
                      <Select
                        value={location.state}
                        onValueChange={(value) => {
                          const updated = [...field.value];
                          updated[index].state = value;
                          field.onChange(updated);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="Radius"
                        value={location.radius}
                        onChange={(e) => {
                          const updated = [...field.value];
                          updated[index].radius = parseInt(e.target.value) || 50;
                          field.onChange(updated);
                        }}
                      />
                    </div>
                    {field.value.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLocation(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {field.value.length < 3 && (
                <Button type="button" variant="outline" onClick={addLocation}>
                  Add Location
                </Button>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxDistance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Travel Distance (miles)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="200"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deadMileLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dead Mile Limit (miles)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="50"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Truck className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Equipment & Services</h3>
        <p className="text-gray-600">Select your equipment types and special services</p>
      </div>

      <FormField
        control={form.control}
        name="equipmentTypes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Equipment Types</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {EQUIPMENT_TYPES.map((equipment) => (
                <div key={equipment} className="flex items-center space-x-2">
                  <Checkbox
                    id={equipment}
                    checked={field.value.includes(equipment)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([...field.value, equipment]);
                      } else {
                        field.onChange(field.value.filter(item => item !== equipment));
                      }
                    }}
                  />
                  <label htmlFor={equipment} className="text-sm">{equipment}</label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="specialServices"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Special Services (Optional)</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SPECIAL_SERVICES.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={field.value?.includes(service) || false}
                    onCheckedChange={(checked) => {
                      const current = field.value || [];
                      if (checked) {
                        field.onChange([...current, service]);
                      } else {
                        field.onChange(current.filter(item => item !== service));
                      }
                    }}
                  />
                  <label htmlFor={service} className="text-sm">{service}</label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="minRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Rate (per mile)</FormLabel>
            <FormControl>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="2.00"
                  className="pl-10"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Commitment Agreement</h3>
        <p className="text-gray-600">Review and confirm your availability commitment</p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Platform Commitment Policy:</strong>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Zero tolerance for ghosting or missed commitments</li>
            <li>Commitment score affects job opportunities and platform fees</li>
            <li>Consistent work with companies reduces fees by 10%</li>
            <li>Long-term contracts offer 5-15% additional discounts</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h4 className="font-medium">Your Availability Summary:</h4>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Preferred Locations:</strong>
            {form.getValues("preferredLocations").map((loc, i) => (
              <Badge key={i} variant="outline" className="ml-1">
                {loc.city}, {loc.state} ({loc.radius}mi)
              </Badge>
            ))}
          </div>
          <div><strong>Max Distance:</strong> {form.getValues("maxDistance")} miles</div>
          <div><strong>Dead Mile Limit:</strong> {form.getValues("deadMileLimit")} miles</div>
          <div><strong>Equipment:</strong> {form.getValues("equipmentTypes").join(", ")}</div>
          <div><strong>Minimum Rate:</strong> ${form.getValues("minRate")}/mile</div>
        </div>
      </div>

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any additional information about your availability or preferences..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="isAvailable"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                I am currently available for job opportunities
              </FormLabel>
              <p className="text-sm text-gray-600">
                You can change this setting anytime in your dashboard
              </p>
            </div>
          </FormItem>
        )}
      />
    </div>
  );

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Availability Setup - Step {currentStep} of 3
        </CardTitle>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="flex justify-between">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="ml-auto"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="ml-auto"
                  disabled={createAvailabilityMutation.isPending}
                >
                  {createAvailabilityMutation.isPending ? "Saving..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}