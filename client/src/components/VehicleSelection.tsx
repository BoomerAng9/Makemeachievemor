import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Car, Users, Heart, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface VehicleType {
  category: string;
  vehicles: string[];
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Freight & Cargo':
      return <Truck className="h-5 w-5" />;
    case 'Passenger Transport':
      return <Users className="h-5 w-5" />;
    case 'Medical Transport':
      return <Heart className="h-5 w-5" />;
    case 'Specialized Services':
      return <Wrench className="h-5 w-5" />;
    default:
      return <Car className="h-5 w-5" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Freight & Cargo':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'Passenger Transport':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'Medical Transport':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'Specialized Services':
      return 'bg-purple-50 border-purple-200 text-purple-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

export function VehicleSelection() {
  const { data: vehicleTypes, isLoading } = useQuery<VehicleType[]>({
    queryKey: ['/api/vehicle-types'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Select Your Vehicle Type</h2>
        <p className="text-muted-foreground">Choose from our comprehensive fleet options</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicleTypes?.map((category) => (
          <Card key={category.category} className={`border-2 ${getCategoryColor(category.category)}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {getCategoryIcon(category.category)}
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {category.vehicles.map((vehicle) => (
                  <Button
                    key={vehicle}
                    variant="outline"
                    className="justify-start h-auto p-3 text-left"
                    onClick={() => {
                      // Handle vehicle selection
                      console.log('Selected vehicle:', vehicle);
                    }}
                  >
                    <div>
                      <div className="font-medium">{vehicle}</div>
                      <div className="text-xs text-muted-foreground">
                        {getVehicleDescription(vehicle)}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function getVehicleDescription(vehicle: string): string {
  const descriptions: Record<string, string> = {
    'Semi-truck (Dry Van)': 'Standard freight hauling',
    'Semi-truck (Refrigerated)': 'Temperature-controlled cargo',
    'Semi-truck (Flatbed)': 'Open deck transport',
    'Semi-truck (Tanker)': 'Liquid cargo transport',
    'Box Truck (26ft)': 'Large local deliveries',
    'Box Truck (20ft)': 'Medium local deliveries',
    'Box Truck (16ft)': 'Small local deliveries',
    'Cargo Van': 'Small package delivery',
    'Sprinter Van': 'Express delivery service',
    'Transit Van (Cargo)': 'Commercial cargo transport',
    'Pickup Truck (Dual Axle)': 'Heavy equipment hauling',
    'Pickup Truck (Single Axle)': 'Light equipment transport',
    'Straight Truck': 'Direct cargo delivery',
    'Sedan (4 passengers)': 'Executive transport',
    'SUV (7 passengers)': 'Family transport',
    'Minivan (8 passengers)': 'Group transport',
    'Passenger Van (12 passengers)': 'Small group transport',
    'Transit Van (Passenger)': 'Corporate shuttles',
    'Sprinter Van (Passenger)': 'Luxury group transport',
    'Charter Bus (25 passengers)': 'Medium group events',
    'Motor Coach (45+ passengers)': 'Large group events',
    'School Bus': 'Educational transport',
    'Party Bus (20-40 passengers)': 'Entertainment transport',
    'Medical Transport Van': 'Non-emergency medical',
    'Wheelchair Accessible Vehicle': 'Mobility assistance',
    'Ambulance (Non-Emergency)': 'Medical transport',
    'Dialysis Transport Vehicle': 'Regular dialysis appointments',
    'Medical Sedan': 'Medical appointments',
    'Medical SUV': 'Comfortable medical transport',
    'Tow Truck (Light Duty)': 'Vehicle recovery',
    'Tow Truck (Heavy Duty)': 'Commercial vehicle recovery',
    'Recovery Vehicle': 'Roadside assistance',
    'Moving Truck (Small)': 'Residential moving',
    'Moving Truck (Large)': 'Commercial moving',
    'Delivery Truck': 'Package delivery',
    'Food Truck': 'Mobile food service',
    'Mobile Service Vehicle': 'On-site services'
  };
  
  return descriptions[vehicle] || 'Specialized transport';
}