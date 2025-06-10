import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { useCreateVehicle, useUploadDocument } from "@/hooks/useContractor";
import { useToast } from "@/hooks/use-toast";
import { Truck, Camera, FileText } from "lucide-react";

const vehicleSchema = z.object({
  vehicleType: z.string().min(1, "Vehicle type is required"),
  year: z.number().min(1900, "Valid year is required").max(new Date().getFullYear() + 1),
  make: z.string().min(1, "Make is required"),
  model: z.string().optional(),
  licensePlate: z.string().optional(),
  vinNumber: z.string().optional(),
});

type VehicleData = z.infer<typeof vehicleSchema>;

interface VehicleInfoStepProps {
  contractorId: number;
  onComplete: (data: any) => void;
}

export function VehicleInfoStep({ contractorId, onComplete }: VehicleInfoStepProps) {
  const [vehiclePhotos, setVehiclePhotos] = useState<File[]>([]);
  const [insuranceDocs, setInsuranceDocs] = useState<File[]>([]);
  const { toast } = useToast();
  
  const createVehicle = useCreateVehicle(contractorId);
  const uploadDocument = useUploadDocument(contractorId);

  const form = useForm<VehicleData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicleType: "",
      year: new Date().getFullYear(),
      make: "",
      model: "",
      licensePlate: "",
      vinNumber: "",
    },
  });

  const handleVehiclePhotoUpload = (file: File) => {
    setVehiclePhotos(prev => [...prev, file]);
  };

  const handleInsuranceUpload = (file: File) => {
    setInsuranceDocs(prev => [...prev, file]);
  };

  const onSubmit = async (data: VehicleData) => {
    try {
      // Create vehicle record
      const vehicle = await createVehicle.mutateAsync(data);

      // Upload vehicle photos
      for (const file of vehiclePhotos) {
        await uploadDocument.mutateAsync({
          file,
          documentType: 'vehicle_photo'
        });
      }

      // Upload insurance documents
      for (const file of insuranceDocs) {
        await uploadDocument.mutateAsync({
          file,
          documentType: 'insurance'
        });
      }

      toast({
        title: "Vehicle information saved",
        description: "Your vehicle details and documents have been recorded.",
      });

      onComplete({ vehicle, photosUploaded: vehiclePhotos.length, insuranceUploaded: insuranceDocs.length });
    } catch (error) {
      toast({
        title: "Error saving vehicle information",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
            <Truck className="h-4 w-4" />
          </div>
          <CardTitle>Vehicle Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="box_truck">Box Truck</SelectItem>
                        <SelectItem value="semi_truck">Semi Truck</SelectItem>
                        <SelectItem value="pickup_truck">Pickup Truck</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="2020" 
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
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ford" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Transit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Plate</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vinNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VIN Number</FormLabel>
                    <FormControl>
                      <Input placeholder="1FTBW3XM..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Vehicle Photos Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                  <Camera className="h-4 w-4 mr-2" />
                  Vehicle Photos
                </h4>
                <p className="text-sm text-gray-500 mb-4">Upload exterior and interior photos</p>
                <FileUpload
                  onFileSelect={handleVehiclePhotoUpload}
                  accept="image/*"
                >
                  <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Upload Photos</p>
                  <p className="text-xs text-gray-500">Multiple photos allowed</p>
                </FileUpload>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Insurance Documents
                </h4>
                <p className="text-sm text-gray-500 mb-4">Current insurance certificate</p>
                <FileUpload
                  onFileSelect={handleInsuranceUpload}
                  accept="image/*,.pdf"
                >
                  <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Upload Insurance</p>
                  <p className="text-xs text-gray-500">PDF or image format</p>
                </FileUpload>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit"
                disabled={createVehicle.isPending || uploadDocument.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {createVehicle.isPending || uploadDocument.isPending ? "Saving..." : "Continue to Compliance"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
