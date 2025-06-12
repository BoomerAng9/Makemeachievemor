import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  Settings,
  Globe,
  Navigation
} from "lucide-react";
import LocationTracker from "@/components/maps/LocationTracker";

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

export default function LocationServices() {
  // Check Maps API status
  const { data: mapsStatus, isLoading: mapsLoading } = useQuery<MapsApiStatus>({
    queryKey: ["/api/maps/status"],
    refetchInterval: 10000, // Check every 10 seconds
  });

  const requiredApis = [
    {
      name: "Geocoding API",
      description: "Convert addresses to coordinates",
      required: true,
      enabled: mapsStatus?.services.geocoding || false
    },
    {
      name: "Maps JavaScript API", 
      description: "Interactive maps display",
      required: true,
      enabled: mapsStatus?.services.maps || false
    },
    {
      name: "Places API",
      description: "Location search and details",
      required: true,
      enabled: mapsStatus?.services.places || false
    },
    {
      name: "Directions API",
      description: "Route calculation and optimization",
      required: true,
      enabled: mapsStatus?.services.directions || false
    }
  ];

  const setupInstructions = [
    "Go to Google Cloud Console (console.cloud.google.com)",
    "Select your project or create a new one",
    "Navigate to APIs & Services > Library",
    "Search for and enable each required API",
    "Go to APIs & Services > Credentials",
    "Create or update your API key",
    "Configure API key restrictions (optional but recommended)"
  ];

  if (mapsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking location services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Globe className="h-8 w-8" />
          Location Services
        </h1>
        <p className="text-muted-foreground">
          Manage location tracking and route optimization for contractors
        </p>
      </div>

      {/* API Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Google Maps API Status
          </CardTitle>
          <CardDescription>
            Current status of location and mapping services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {mapsStatus ? (
            <>
              {/* Overall Status */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                {mapsStatus.apiKeyValid ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                )}
                <div>
                  <h3 className="font-semibold">
                    {mapsStatus.apiKeyValid ? "Services Active" : "Configuration Required"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{mapsStatus.message}</p>
                  {mapsStatus.error && (
                    <p className="text-sm text-red-600 mt-1">{mapsStatus.error}</p>
                  )}
                </div>
              </div>

              {/* API Services Status */}
              <div>
                <h4 className="font-medium mb-4">Required API Services</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requiredApis.map((api) => (
                    <div key={api.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{api.name}</div>
                        <div className="text-sm text-muted-foreground">{api.description}</div>
                      </div>
                      <Badge variant={api.enabled ? "default" : "destructive"}>
                        {api.enabled ? "Enabled" : "Required"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Setup Instructions */}
              {!mapsStatus.apiKeyValid && (
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Setup Instructions
                    </h4>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <p className="mb-3">To activate location services, follow these steps:</p>
                        <ol className="list-decimal list-inside space-y-2">
                          {setupInstructions.map((instruction, index) => (
                            <li key={index} className="text-sm">{instruction}</li>
                          ))}
                        </ol>
                      </AlertDescription>
                    </Alert>
                    
                    <div className="mt-4 flex gap-3">
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href="https://console.cloud.google.com/apis/library" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Google Cloud Console
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href="https://developers.google.com/maps/documentation/geocoding/get-api-key" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          API Key Guide
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Unable to check Google Maps API status. Please verify your internet connection.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Location Tracker Component */}
      <LocationTracker />

      {/* Feature Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Available Features
          </CardTitle>
          <CardDescription>
            Features that will be available once location services are configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Real-time Location",
                description: "Track contractor locations in real-time",
                icon: MapPin
              },
              {
                title: "Route Optimization", 
                description: "Calculate optimal routes for deliveries",
                icon: Navigation
              },
              {
                title: "Nearby Load Search",
                description: "Find available loads within specified radius",
                icon: Globe
              }
            ].map((feature, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <feature.icon className="h-6 w-6 mb-2 text-primary" />
                <h4 className="font-medium">{feature.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}