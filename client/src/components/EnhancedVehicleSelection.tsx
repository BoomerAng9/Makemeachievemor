import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Truck, 
  Car, 
  Bus, 
  Heart, 
  Package, 
  Users, 
  Stethoscope,
  Shield,
  Zap
} from "lucide-react";

// Enhanced vehicle types for all service categories
export const VEHICLE_CATEGORIES = {
  medical_transport: {
    label: "Medical Transport",
    icon: Heart,
    description: "Patient transport and medical services",
    vehicles: [
      { value: "sedan", label: "Sedan", description: "Standard patient transport" },
      { value: "suv", label: "SUV", description: "Comfortable patient transport" },
      { value: "wheelchair_van", label: "Wheelchair Van", description: "Wheelchair accessible transport" },
      { value: "ambulette", label: "Ambulette", description: "Non-emergency medical transport" },
      { value: "medical_van", label: "Medical Van", description: "Equipped medical transport" }
    ]
  },
  caregiving: {
    label: "Caregiving Services",
    icon: Stethoscope,
    description: "Home care and personal assistance",
    vehicles: [
      { value: "sedan", label: "Sedan", description: "Personal care visits" },
      { value: "suv", label: "SUV", description: "Equipment transport" },
      { value: "van", label: "Van", description: "Mobile care services" }
    ]
  },
  delivery: {
    label: "Delivery Services",
    icon: Package,
    description: "Package and goods delivery",
    vehicles: [
      { value: "sedan", label: "Sedan", description: "Small package delivery" },
      { value: "pickup_truck", label: "Pickup Truck", description: "Medium cargo delivery" },
      { value: "delivery_van", label: "Delivery Van", description: "Package and goods delivery" },
      { value: "box_truck", label: "Box Truck", description: "Large item delivery" }
    ]
  },
  freight: {
    label: "Freight Transport",
    icon: Truck,
    description: "Commercial cargo transport",
    vehicles: [
      { value: "pickup_truck", label: "Pickup Truck", description: "Light freight" },
      { value: "box_truck", label: "Box Truck", description: "Medium freight" },
      { value: "semi_truck", label: "Semi Truck", description: "Heavy freight" },
      { value: "flatbed", label: "Flatbed", description: "Specialized cargo" }
    ]
  },
  passenger: {
    label: "Passenger Transport",
    icon: Users,
    description: "People transportation services",
    vehicles: [
      { value: "sedan", label: "Sedan", description: "1-4 passengers" },
      { value: "suv", label: "SUV", description: "4-7 passengers" },
      { value: "van", label: "Van", description: "8-15 passengers" },
      { value: "party_bus", label: "Party Bus", description: "Special events transport" }
    ]
  }
};

// Medical equipment options
export const MEDICAL_EQUIPMENT = [
  { value: "wheelchair_lift", label: "Wheelchair Lift" },
  { value: "oxygen_tanks", label: "Oxygen Equipment" },
  { value: "first_aid", label: "First Aid Kit" },
  { value: "aed", label: "AED (Defibrillator)" },
  { value: "stretcher", label: "Stretcher/Gurney" },
  { value: "iv_equipment", label: "IV Equipment" }
];

interface VehicleData {
  vehicleType: string;
  serviceCategory: string;
  year: number;
  make: string;
  model: string;
  licensePlate?: string;
  vinNumber?: string;
  passengerCapacity?: number;
  cargoVolume?: number;
  maxWeight?: number;
  wheelchairAccessible: boolean;
  stretcherCapable: boolean;
  oxygenCapable: boolean;
  medicalEquipment: string[];
  liftGate: boolean;
  refrigerated: boolean;
  commercialInsurance: boolean;
  condition: string;
}

interface EnhancedVehicleSelectionProps {
  onVehicleSelect: (vehicle: VehicleData) => void;
  initialData?: Partial<VehicleData>;
  isOptional?: boolean;
}

export function EnhancedVehicleSelection({ 
  onVehicleSelect, 
  initialData,
  isOptional = false 
}: EnhancedVehicleSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialData?.serviceCategory || "");
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    vehicleType: initialData?.vehicleType || "",
    serviceCategory: initialData?.serviceCategory || "",
    year: initialData?.year || new Date().getFullYear(),
    make: initialData?.make || "",
    model: initialData?.model || "",
    licensePlate: initialData?.licensePlate || "",
    vinNumber: initialData?.vinNumber || "",
    passengerCapacity: initialData?.passengerCapacity || 0,
    cargoVolume: initialData?.cargoVolume || 0,
    maxWeight: initialData?.maxWeight || 0,
    wheelchairAccessible: initialData?.wheelchairAccessible || false,
    stretcherCapable: initialData?.stretcherCapable || false,
    oxygenCapable: initialData?.oxygenCapable || false,
    medicalEquipment: initialData?.medicalEquipment || [],
    liftGate: initialData?.liftGate || false,
    refrigerated: initialData?.refrigerated || false,
    commercialInsurance: initialData?.commercialInsurance || false,
    condition: initialData?.condition || "good"
  });

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setVehicleData(prev => ({
      ...prev,
      serviceCategory: category,
      vehicleType: "" // Reset vehicle type when category changes
    }));
  };

  const handleVehicleTypeSelect = (vehicleType: string) => {
    const updatedData = { ...vehicleData, vehicleType };
    setVehicleData(updatedData);
    onVehicleSelect(updatedData);
  };

  const updateVehicleData = (field: keyof VehicleData, value: any) => {
    const updatedData = { ...vehicleData, [field]: value };
    setVehicleData(updatedData);
    onVehicleSelect(updatedData);
  };

  const handleMedicalEquipmentChange = (equipment: string, checked: boolean) => {
    const currentEquipment = vehicleData.medicalEquipment;
    const updatedEquipment = checked 
      ? [...currentEquipment, equipment]
      : currentEquipment.filter(item => item !== equipment);
    
    updateVehicleData('medicalEquipment', updatedEquipment);
  };

  if (isOptional && !selectedCategory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Information (Optional)
          </CardTitle>
          <CardDescription>
            You can add vehicle information now or complete your setup later. 
            Vehicle details are required before you can start accepting jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(VEHICLE_CATEGORIES).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={key} 
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleCategorySelect(key)}
                >
                  <CardContent className="p-4 text-center">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">{category.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => onVehicleSelect(vehicleData)}
            >
              Skip for Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Category Selection */}
      {!selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Select Service Category</CardTitle>
            <CardDescription>
              Choose the type of services you want to provide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(VEHICLE_CATEGORIES).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <Card 
                    key={key} 
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleCategorySelect(key)}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-semibold">{category.label}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Type Selection */}
      {selectedCategory && !vehicleData.vehicleType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Select Vehicle Type
            </CardTitle>
            <CardDescription>
              Choose your vehicle for {VEHICLE_CATEGORIES[selectedCategory as keyof typeof VEHICLE_CATEGORIES]?.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VEHICLE_CATEGORIES[selectedCategory as keyof typeof VEHICLE_CATEGORIES]?.vehicles.map(vehicle => (
                <Card 
                  key={vehicle.value}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleVehicleTypeSelect(vehicle.value)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{vehicle.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedCategory("")}
              >
                Back to Categories
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Details Form */}
      {selectedCategory && vehicleData.vehicleType && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
            <CardDescription>
              Provide information about your {vehicleData.vehicleType}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Vehicle Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={vehicleData.year}
                  onChange={(e) => updateVehicleData('year', parseInt(e.target.value))}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div>
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={vehicleData.make}
                  onChange={(e) => updateVehicleData('make', e.target.value)}
                  placeholder="e.g. Ford, Chevrolet"
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={vehicleData.model}
                  onChange={(e) => updateVehicleData('model', e.target.value)}
                  placeholder="e.g. Transit, Express"
                />
              </div>
            </div>

            {/* Capacity Information */}
            {(selectedCategory === 'passenger' || selectedCategory === 'medical_transport') && (
              <div>
                <Label htmlFor="passengerCapacity">Passenger Capacity</Label>
                <Input
                  id="passengerCapacity"
                  type="number"
                  value={vehicleData.passengerCapacity}
                  onChange={(e) => updateVehicleData('passengerCapacity', parseInt(e.target.value))}
                  min="1"
                  max="50"
                />
              </div>
            )}

            {/* Cargo Information */}
            {(selectedCategory === 'delivery' || selectedCategory === 'freight') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cargoVolume">Cargo Volume (cubic feet)</Label>
                  <Input
                    id="cargoVolume"
                    type="number"
                    value={vehicleData.cargoVolume}
                    onChange={(e) => updateVehicleData('cargoVolume', parseFloat(e.target.value))}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxWeight">Max Weight (pounds)</Label>
                  <Input
                    id="maxWeight"
                    type="number"
                    value={vehicleData.maxWeight}
                    onChange={(e) => updateVehicleData('maxWeight', parseInt(e.target.value))}
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* Medical Transport Features */}
            {selectedCategory === 'medical_transport' && (
              <div className="space-y-4">
                <h4 className="font-semibold">Medical Transport Features</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="wheelchairAccessible"
                      checked={vehicleData.wheelchairAccessible}
                      onCheckedChange={(checked) => updateVehicleData('wheelchairAccessible', checked)}
                    />
                    <Label htmlFor="wheelchairAccessible">Wheelchair Accessible</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="stretcherCapable"
                      checked={vehicleData.stretcherCapable}
                      onCheckedChange={(checked) => updateVehicleData('stretcherCapable', checked)}
                    />
                    <Label htmlFor="stretcherCapable">Stretcher Capable</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="oxygenCapable"
                      checked={vehicleData.oxygenCapable}
                      onCheckedChange={(checked) => updateVehicleData('oxygenCapable', checked)}
                    />
                    <Label htmlFor="oxygenCapable">Oxygen Capable</Label>
                  </div>
                </div>

                <div>
                  <Label>Medical Equipment</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {MEDICAL_EQUIPMENT.map(equipment => (
                      <div key={equipment.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={equipment.value}
                          checked={vehicleData.medicalEquipment.includes(equipment.value)}
                          onCheckedChange={(checked) => handleMedicalEquipmentChange(equipment.value, checked as boolean)}
                        />
                        <Label htmlFor={equipment.value} className="text-sm">
                          {equipment.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Features */}
            {(selectedCategory === 'delivery' || selectedCategory === 'freight') && (
              <div className="space-y-4">
                <h4 className="font-semibold">Delivery Features</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="liftGate"
                      checked={vehicleData.liftGate}
                      onCheckedChange={(checked) => updateVehicleData('liftGate', checked)}
                    />
                    <Label htmlFor="liftGate">Lift Gate</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="refrigerated"
                      checked={vehicleData.refrigerated}
                      onCheckedChange={(checked) => updateVehicleData('refrigerated', checked)}
                    />
                    <Label htmlFor="refrigerated">Refrigerated</Label>
                  </div>
                </div>
              </div>
            )}

            {/* Insurance and Compliance */}
            <div className="space-y-4">
              <h4 className="font-semibold">Insurance & Compliance</h4>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="commercialInsurance"
                  checked={vehicleData.commercialInsurance}
                  onCheckedChange={(checked) => updateVehicleData('commercialInsurance', checked)}
                />
                <Label htmlFor="commercialInsurance">Commercial Insurance</Label>
              </div>
              
              <div>
                <Label htmlFor="condition">Vehicle Condition</Label>
                <Select value={vehicleData.condition} onValueChange={(value) => updateVehicleData('condition', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="needs_attention">Needs Attention</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setVehicleData(prev => ({ ...prev, vehicleType: "" }))}
              >
                Back to Vehicle Types
              </Button>
              
              <Button onClick={() => onVehicleSelect(vehicleData)}>
                Save Vehicle Information
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}