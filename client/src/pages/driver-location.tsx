import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  MapPin, 
  Navigation, 
  Truck, 
  Clock, 
  DollarSign, 
  Route,
  Target,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  Filter
} from "lucide-react";
import { format } from "date-fns";

interface DriverLocation {
  id: number;
  latitude: string;
  longitude: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isAvailable: boolean;
  vehicleType?: string;
  maxDistance: number;
  lastUpdated: string;
}

interface LoadOpportunity {
  id: number;
  title: string;
  description?: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupLatitude?: string;
  pickupLongitude?: string;
  deliveryLatitude?: string;
  deliveryLongitude?: string;
  distance?: number;
  weight?: number;
  payment: string;
  pickupTime?: string;
  deliveryTime?: string;
  jobType: string;
  category: string;
  status: string;
  requirements?: any;
  createdAt: string;
}

const VEHICLE_TYPES = [
  { value: "van", label: "Cargo Van" },
  { value: "box_truck", label: "Box Truck" },
  { value: "semi_truck", label: "Semi Truck" },
  { value: "pickup_truck", label: "Pickup Truck" },
  { value: "flatbed", label: "Flatbed" },
  { value: "refrigerated", label: "Refrigerated" },
];

export default function DriverLocation() {
  const { user, isAuthenticated } = useAuth();
  const [currentAddress, setCurrentAddress] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [maxDistance, setMaxDistance] = useState([100]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [filterJobType, setFilterJobType] = useState("all");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Fetch current location
  const { data: driverLocation, isLoading: locationLoading } = useQuery({
    queryKey: ["/api/location/driver"],
    enabled: isAuthenticated,
  });

  // Fetch nearby loads
  const { data: nearbyLoads = [], isLoading: loadsLoading, refetch: refetchLoads } = useQuery({
    queryKey: ["/api/location/nearby-loads", maxDistance[0]],
    enabled: isAuthenticated && !!driverLocation,
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/location/update", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/location/driver"] });
      queryClient.invalidateQueries({ queryKey: ["/api/location/nearby-loads"] });
    },
  });

  // Get current position using browser geolocation
  const getCurrentPosition = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocode the coordinates to get address
          const response = await fetch(
            `/api/location/reverse-geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`
          );
          const data = await response.json();
          
          if (data.address) {
            setCurrentAddress(data.address);
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your current location. Please enter your address manually.");
        setIsGettingLocation(false);
      }
    );
  };

  const handleUpdateLocation = () => {
    if (!currentAddress.trim()) {
      alert("Please enter your current address");
      return;
    }

    updateLocationMutation.mutate({
      address: currentAddress,
      vehicleType,
      maxDistance: maxDistance[0],
      isAvailable,
    });
  };

  const handleAcceptLoad = async (loadId: number) => {
    try {
      await apiRequest(`/api/opportunities/${loadId}/accept`, {
        method: "POST",
      });
      refetchLoads();
    } catch (error) {
      console.error("Error accepting load:", error);
    }
  };

  const filteredLoads = nearbyLoads.filter((load: LoadOpportunity) => {
    if (filterJobType === "all") return true;
    return load.jobType === filterJobType;
  });

  const formatPayment = (payment: string) => {
    const amount = parseFloat(payment);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold mb-2">Driver Location</h2>
          <p className="text-muted-foreground mb-4">Please sign in to access location services and load matching.</p>
          <Button onClick={() => window.location.href = "/api/login"}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Driver Location & Load Matching</h1>
              <p className="text-muted-foreground">Update your location to find nearby freight opportunities</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Location Settings */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Location Settings
                </CardTitle>
                <CardDescription>
                  Update your current location and availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Current Address</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="address"
                      value={currentAddress}
                      onChange={(e) => setCurrentAddress(e.target.value)}
                      placeholder="Enter your current address"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={getCurrentPosition}
                      disabled={isGettingLocation}
                    >
                      {isGettingLocation ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Navigation className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Maximum Distance: {maxDistance[0]} miles</Label>
                  <Slider
                    value={maxDistance}
                    onValueChange={setMaxDistance}
                    max={500}
                    min={10}
                    step={10}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="available">Available for Loads</Label>
                  <Switch
                    id="available"
                    checked={isAvailable}
                    onCheckedChange={setIsAvailable}
                  />
                </div>

                <Button 
                  onClick={handleUpdateLocation}
                  className="w-full"
                  disabled={updateLocationMutation.isPending}
                >
                  {updateLocationMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Update Location
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Current Status */}
            {driverLocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={driverLocation.isAvailable ? "default" : "secondary"}>
                      {driverLocation.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-muted-foreground">Location:</span>
                    <p className="mt-1">{driverLocation.address}</p>
                  </div>
                  
                  {driverLocation.vehicleType && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Vehicle</span>
                      <span className="text-sm font-medium">
                        {VEHICLE_TYPES.find(v => v.value === driverLocation.vehicleType)?.label}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Search Radius</span>
                    <span className="text-sm font-medium">{driverLocation.maxDistance} miles</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Last updated: {format(new Date(driverLocation.lastUpdated), "MMM dd, yyyy HH:mm")}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Nearby Loads */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Nearby Loads ({filteredLoads.length})
                    </CardTitle>
                    <CardDescription>
                      Available freight opportunities within your search radius
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={filterJobType} onValueChange={setFilterJobType}>
                      <SelectTrigger className="w-32">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="ltl">LTL</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => refetchLoads()}
                      disabled={loadsLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${loadsLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredLoads.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Loads Available</h3>
                    <p className="text-muted-foreground mb-4">
                      {!driverLocation 
                        ? "Update your location to see available loads"
                        : "No freight opportunities found within your search radius"
                      }
                    </p>
                    {!driverLocation && (
                      <Button onClick={() => setShowSettings(true)}>
                        <MapPin className="h-4 w-4 mr-2" />
                        Set Location
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLoads.map((load: LoadOpportunity) => (
                      <Card key={load.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{load.title}</h4>
                              {load.description && (
                                <p className="text-sm text-muted-foreground mt-1">{load.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">
                                {formatPayment(load.payment)}
                              </div>
                              <Badge variant="outline" className="mt-1">
                                {load.jobType}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Pickup</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{load.pickupLocation}</p>
                              {load.pickupTime && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(load.pickupTime), "MMM dd, HH:mm")}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium">Delivery</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{load.deliveryLocation}</p>
                              {load.deliveryTime && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(load.deliveryTime), "MMM dd, HH:mm")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {load.distance && (
                                <div className="flex items-center gap-1">
                                  <Route className="h-3 w-3" />
                                  {load.distance.toFixed(1)} miles
                                </div>
                              )}
                              {load.weight && (
                                <span>{load.weight.toLocaleString()} lbs</span>
                              )}
                              <span>{format(new Date(load.createdAt), "MMM dd")}</span>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleAcceptLoad(load.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept Load
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}