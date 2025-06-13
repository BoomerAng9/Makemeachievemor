import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { MapPin, Target, Radius } from "lucide-react";

// US States for dropdown
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

interface LocationData {
  zipCode: string;
  city: string;
  state: string;
  serviceRadius: number;
  maxDistance: number;
  serviceTypes: string[];
  latitude?: number;
  longitude?: number;
}

interface EnhancedLocationSettingsProps {
  onLocationUpdate: (location: LocationData) => void;
  initialData?: Partial<LocationData>;
  isRequired?: boolean;
}

export function EnhancedLocationSettings({ 
  onLocationUpdate, 
  initialData,
  isRequired = false 
}: EnhancedLocationSettingsProps) {
  const [locationData, setLocationData] = useState<LocationData>({
    zipCode: initialData?.zipCode || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    serviceRadius: initialData?.serviceRadius || 25,
    maxDistance: initialData?.maxDistance || 100,
    serviceTypes: initialData?.serviceTypes || [],
    latitude: initialData?.latitude,
    longitude: initialData?.longitude
  });

  const [isValidatingZip, setIsValidatingZip] = useState(false);
  const [zipError, setZipError] = useState("");

  // Service types available
  const SERVICE_TYPES = [
    { value: "medical_transport", label: "Medical Transport" },
    { value: "caregiving", label: "Caregiving Services" },
    { value: "delivery", label: "Package Delivery" },
    { value: "freight", label: "Freight Transport" },
    { value: "passenger", label: "Passenger Transport" }
  ];

  // Validate and geocode zip code
  const validateZipCode = async (zipCode: string) => {
    if (!/^\d{5}(-\d{4})?$/.test(zipCode)) {
      setZipError("Please enter a valid 5-digit ZIP code");
      return;
    }

    setIsValidatingZip(true);
    setZipError("");

    try {
      // Use a free ZIP code API to get city/state
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      
      if (response.ok) {
        const data = await response.json();
        const place = data.places[0];
        
        const updatedLocation = {
          ...locationData,
          zipCode,
          city: place['place name'],
          state: place['state'],
          latitude: parseFloat(data.lat),
          longitude: parseFloat(data.lng)
        };
        
        setLocationData(updatedLocation);
        onLocationUpdate(updatedLocation);
        setZipError("");
      } else {
        setZipError("ZIP code not found. Please check and try again.");
      }
    } catch (error) {
      setZipError("Unable to validate ZIP code. Please check your internet connection.");
    } finally {
      setIsValidatingZip(false);
    }
  };

  const handleZipCodeChange = (zipCode: string) => {
    setLocationData(prev => ({ ...prev, zipCode }));
    
    // Auto-validate when ZIP code is complete
    if (/^\d{5}$/.test(zipCode)) {
      validateZipCode(zipCode);
    }
  };

  const handleStateChange = (state: string) => {
    const updatedLocation = { ...locationData, state };
    setLocationData(updatedLocation);
    onLocationUpdate(updatedLocation);
  };

  const handleServiceRadiusChange = (radius: number[]) => {
    const updatedLocation = { ...locationData, serviceRadius: radius[0] };
    setLocationData(updatedLocation);
    onLocationUpdate(updatedLocation);
  };

  const handleMaxDistanceChange = (distance: number[]) => {
    const updatedLocation = { ...locationData, maxDistance: distance[0] };
    setLocationData(updatedLocation);
    onLocationUpdate(updatedLocation);
  };

  const toggleServiceType = (serviceType: string) => {
    const currentTypes = locationData.serviceTypes;
    const updatedTypes = currentTypes.includes(serviceType)
      ? currentTypes.filter(type => type !== serviceType)
      : [...currentTypes, serviceType];
    
    const updatedLocation = { ...locationData, serviceTypes: updatedTypes };
    setLocationData(updatedLocation);
    onLocationUpdate(updatedLocation);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location & Service Area
        </CardTitle>
        <CardDescription>
          Set your operating location using ZIP code and define your service area
          {!isRequired && " (Optional - can be completed later)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ZIP Code Input */}
        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code {isRequired && "*"}</Label>
          <div className="flex gap-2">
            <Input
              id="zipCode"
              value={locationData.zipCode}
              onChange={(e) => handleZipCodeChange(e.target.value)}
              placeholder="Enter 5-digit ZIP code"
              maxLength={5}
              className={zipError ? "border-destructive" : ""}
            />
            {locationData.zipCode.length === 5 && (
              <Button 
                variant="outline" 
                onClick={() => validateZipCode(locationData.zipCode)}
                disabled={isValidatingZip}
              >
                {isValidatingZip ? "Validating..." : "Verify"}
              </Button>
            )}
          </div>
          {zipError && (
            <p className="text-sm text-destructive">{zipError}</p>
          )}
        </div>

        {/* Auto-filled City and State */}
        {locationData.city && locationData.state && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>City</Label>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{locationData.city}</span>
              </div>
            </div>
            <div>
              <Label>State</Label>
              <Select value={locationData.state} onValueChange={handleStateChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(state => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Service Area Configuration */}
        {locationData.zipCode && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Primary Service Radius: {locationData.serviceRadius} miles
                </Label>
                <div className="mt-2">
                  <Slider
                    value={[locationData.serviceRadius]}
                    onValueChange={handleServiceRadiusChange}
                    max={50}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>5 miles</span>
                    <span>50 miles</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Area around your ZIP code where you prefer to work
                </p>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Radius className="h-4 w-4" />
                  Maximum Travel Distance: {locationData.maxDistance} miles
                </Label>
                <div className="mt-2">
                  <Slider
                    value={[locationData.maxDistance]}
                    onValueChange={handleMaxDistanceChange}
                    max={500}
                    min={25}
                    step={25}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>25 miles</span>
                    <span>500 miles</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Furthest distance you're willing to travel for high-value jobs
                </p>
              </div>
            </div>

            {/* Service Types */}
            <div className="space-y-3">
              <Label>Service Types You Provide</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SERVICE_TYPES.map(service => (
                  <div
                    key={service.value}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      locationData.serviceTypes.includes(service.value)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => toggleServiceType(service.value)}
                  >
                    <span className="font-medium">{service.label}</span>
                    {locationData.serviceTypes.includes(service.value) && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                ))}
              </div>
              {locationData.serviceTypes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Select at least one service type to receive relevant job opportunities
                </p>
              )}
            </div>

            {/* Location Summary */}
            {locationData.city && locationData.state && (
              <div className="p-4 bg-accent rounded-lg">
                <h4 className="font-semibold mb-2">Service Area Summary</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Base Location:</strong> {locationData.city}, {locationData.state} {locationData.zipCode}</p>
                  <p><strong>Primary Service Area:</strong> {locationData.serviceRadius} mile radius</p>
                  <p><strong>Maximum Travel:</strong> {locationData.maxDistance} miles</p>
                  <p><strong>Services:</strong> {
                    locationData.serviceTypes.length > 0 
                      ? locationData.serviceTypes.map(type => 
                          SERVICE_TYPES.find(s => s.value === type)?.label
                        ).join(", ")
                      : "None selected"
                  }</p>
                </div>
              </div>
            )}
          </div>
        )}

        {!isRequired && !locationData.zipCode && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => onLocationUpdate(locationData)}
            >
              Skip for Now
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              You can set your location later in settings
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}