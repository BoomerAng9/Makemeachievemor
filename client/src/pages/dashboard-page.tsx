import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { EnhancedVehicleSelection } from "@/components/EnhancedVehicleSelection";
import { EnhancedLocationSettings } from "@/components/EnhancedLocationSettings";
import { AvailabilityScheduler } from "@/components/AvailabilityScheduler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Car,
  Shield,
  Settings
} from "lucide-react";

interface VehicleData {
  vehicleType?: string;
  category?: string;
  [key: string]: any;
}

interface LocationData {
  zipCode?: string;
  state?: string;
  city?: string;
  [key: string]: any;
}

interface AvailabilityData {
  schedule?: any;
  trustRating?: number;
  isCurrentlyAvailable?: boolean;
  [key: string]: any;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [vehicleData, setVehicleData] = useState<VehicleData>({});
  const [locationData, setLocationData] = useState<LocationData>({});
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData>({});

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Choose 2 ACHIEVEMOR Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome {user?.firstName || 'User'} - Manage your contractor profile and opportunities
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Car className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {vehicleData.vehicleType ? '1' : '0'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Vehicle Setup</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MapPin className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {locationData.zipCode ? '1' : '0'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Location Set</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {availabilityData.trustRating || 100}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Trust Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {availabilityData.isCurrentlyAvailable ? 'Active' : 'Inactive'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Availability</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Profile Setup Progress</CardTitle>
                <CardDescription>Complete your profile to start receiving job opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Vehicle Information</span>
                    <Badge variant={vehicleData.vehicleType ? "default" : "secondary"}>
                      {vehicleData.vehicleType ? "Complete" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Location Settings</span>
                    <Badge variant={locationData.zipCode ? "default" : "secondary"}>
                      {locationData.zipCode ? "Complete" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Availability Schedule</span>
                    <Badge variant={availabilityData.schedule ? "default" : "secondary"}>
                      {availabilityData.schedule ? "Complete" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles">
            <EnhancedVehicleSelection 
              onVehicleSelect={setVehicleData}
              initialData={vehicleData}
              isOptional={true}
            />
          </TabsContent>

          <TabsContent value="location">
            <EnhancedLocationSettings 
              onLocationUpdate={setLocationData}
              initialData={locationData}
              isRequired={false}
            />
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityScheduler 
              onAvailabilityUpdate={setAvailabilityData}
              initialData={availabilityData}
              isRequired={false}
            />
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Management
                </CardTitle>
                <CardDescription>
                  Upload and manage your compliance documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Document management coming soon
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Upload your CDL, insurance, and other required documents here.
                  </p>
                  <Button className="mt-4" disabled>
                    Upload Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}