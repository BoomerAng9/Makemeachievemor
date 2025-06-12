import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Navigation, 
  Truck, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Route,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MapsApiStatus {
  status: string;
  apiKeyValid: boolean;
  error?: string;
  services: {
    geocoding: boolean;
    maps: boolean;
    places: boolean;
    directions: boolean;
  };
  message: string;
}

interface ContractorLocation {
  id: number;
  userId: string;
  address: string;
  latitude: number;
  longitude: number;
  vehicleType?: string;
  maxDistance?: number;
  createdAt: string;
  updatedAt: string;
}

interface NearbyLoad {
  id: string;
  title: string;
  origin: string;
  destination: string;
  miles: string;
  rate: string;
  distance: number;
  status: string;
}

export default function LocationTracker() {
  const [address, setAddress] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [maxDistance, setMaxDistance] = useState("100");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check Maps API status
  const { data: mapsStatus, isLoading: mapsLoading } = useQuery<MapsApiStatus>({
    queryKey: ["/api/maps/status"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Get current location
  const { data: currentLocation } = useQuery<ContractorLocation>({
    queryKey: ["/api/contractor/location"],
    enabled: mapsStatus?.apiKeyValid === true,
  });

  // Get nearby loads
  const { data: nearbyLoads, isLoading: loadsLoading } = useQuery<NearbyLoad[]>({
    queryKey: ["/api/contractor/nearby-loads", maxDistance],
    enabled: mapsStatus?.apiKeyValid === true && !!currentLocation,
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async (data: { address: string; vehicleType?: string; maxDistance?: number }) => {
      const response = await apiRequest("POST", "/api/contractor/location", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update location");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contractor/location"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contractor/nearby-loads"] });
      toast({
        title: "Location Updated",
        description: "Your location has been successfully updated",
      });
      setAddress("");
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateLocation = () => {
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter a valid address",
        variant: "destructive",
      });
      return;
    }

    updateLocationMutation.mutate({
      address: address.trim(),
      vehicleType: vehicleType || undefined,
      maxDistance: parseInt(maxDistance) || undefined,
    });
  };

  // Get user's current position using browser geolocation
  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setAddress(`${latitude}, ${longitude}`);
        toast({
          title: "Location Detected",
          description: "Current position has been detected",
        });
      },
      (error) => {
        toast({
          title: "Location Error",
          description: "Unable to get your current location",
          variant: "destructive",
        });
      }
    );
  };

  if (mapsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Checking Maps API status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Maps API Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Services Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mapsStatus ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {mapsStatus.apiKeyValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {mapsStatus.apiKeyValid ? "Google Maps API Active" : "Google Maps API Configuration Required"}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">{mapsStatus.message}</p>
              
              {!mapsStatus.apiKeyValid && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    To enable location services, please ensure the following APIs are enabled in Google Cloud Console:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Geocoding API</li>
                      <li>Maps JavaScript API</li>
                      <li>Places API</li>
                      <li>Directions API</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(mapsStatus.services).map(([service, enabled]) => (
                  <div key={service} className="flex items-center gap-2">
                    <Badge variant={enabled ? "default" : "secondary"}>
                      {service.charAt(0).toUpperCase() + service.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Unable to check Maps API status</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Location Update */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Update Your Location
          </CardTitle>
          <CardDescription>
            Set your current location to find nearby opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address or Coordinates</Label>
              <div className="flex gap-2">
                <Input
                  id="address"
                  placeholder="Enter your current location"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={!mapsStatus?.apiKeyValid}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={getCurrentPosition}
                  disabled={!mapsStatus?.apiKeyValid}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semi-truck">Semi Truck</SelectItem>
                  <SelectItem value="box-truck">Box Truck</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="pickup">Pickup Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDistance">Max Distance (miles)</Label>
              <Input
                id="maxDistance"
                type="number"
                placeholder="100"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                disabled={!mapsStatus?.apiKeyValid}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleUpdateLocation}
                disabled={!mapsStatus?.apiKeyValid || updateLocationMutation.isPending}
                className="w-full"
              >
                {updateLocationMutation.isPending ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Update Location
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Location */}
      {currentLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{currentLocation.address}</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Lat: {currentLocation.latitude.toFixed(6)}</span>
                <span>Lng: {currentLocation.longitude.toFixed(6)}</span>
                {currentLocation.vehicleType && (
                  <Badge variant="outline">{currentLocation.vehicleType}</Badge>
                )}
                {currentLocation.maxDistance && (
                  <span>Max: {currentLocation.maxDistance} miles</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nearby Loads */}
      {mapsStatus?.apiKeyValid && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Nearby Opportunities
            </CardTitle>
            <CardDescription>
              Available loads within your specified range
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2">Finding nearby loads...</span>
              </div>
            ) : nearbyLoads && nearbyLoads.length > 0 ? (
              <div className="space-y-4">
                {nearbyLoads.map((load) => (
                  <div key={load.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{load.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {load.origin} → {load.destination}
                        </p>
                      </div>
                      <Badge variant="outline">{load.status}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>{load.miles} miles • ${load.rate}</span>
                      <span className="text-muted-foreground">
                        {load.distance.toFixed(1)} miles away
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : currentLocation ? (
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="mx-auto h-8 w-8 mb-2" />
                <p>No loads found within your specified range</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="mx-auto h-8 w-8 mb-2" />
                <p>Set your location to find nearby opportunities</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}