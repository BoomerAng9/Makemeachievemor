import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  Truck, 
  Search, 
  Filter,
  Eye,
  ExternalLink
} from "lucide-react";
import { UniversalNav } from "@/components/UniversalNav";

export default function OpportunitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["/api/opportunities"],
  });

  // Mock opportunities data for demonstration
  const mockOpportunities = [
    {
      id: 1,
      title: "Long Haul - Atlanta to Los Angeles",
      company: "National Freight Solutions",
      type: "Long Haul",
      origin: "Atlanta, GA",
      destination: "Los Angeles, CA",
      distance: "2,182 miles",
      rate: "$3,200",
      ratePerMile: "$1.47",
      equipment: "Dry Van",
      loadDate: "2025-06-15",
      deliveryDate: "2025-06-18",
      description: "Temperature-controlled electronics shipment. Clean driving record required.",
      requirements: ["CDL Class A", "2+ years experience", "Clean MVR"],
      status: "Available"
    },
    {
      id: 2,
      title: "Regional Route - Dallas Distribution",
      company: "Southwest Logistics",
      type: "Regional",
      origin: "Dallas, TX",
      destination: "Houston, TX",
      distance: "240 miles",
      rate: "$480",
      ratePerMile: "$2.00",
      equipment: "Flatbed",
      loadDate: "2025-06-13",
      deliveryDate: "2025-06-13",
      description: "Construction materials delivery. Tarping experience preferred.",
      requirements: ["CDL Class A", "Flatbed experience", "Own tarps"],
      status: "Urgent"
    },
    {
      id: 3,
      title: "Dedicated Route - Walmart Distribution",
      company: "Retail Transport Partners",
      type: "Dedicated",
      origin: "Memphis, TN",
      destination: "Multiple Locations",
      distance: "300-500 miles/day",
      rate: "$1,800/week",
      ratePerMile: "$1.65",
      equipment: "Reefer",
      loadDate: "2025-06-20",
      deliveryDate: "Ongoing",
      description: "Weekly dedicated route with consistent freight. Home weekends.",
      requirements: ["CDL Class A", "Reefer experience", "HazMat endorsement"],
      status: "Available"
    }
  ];

  const displayOpportunities = Array.isArray(opportunities) && opportunities.length > 0 
    ? opportunities 
    : mockOpportunities;

  const filteredOpportunities = displayOpportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || 
                           opp.origin.toLowerCase().includes(locationFilter.toLowerCase()) ||
                           opp.destination.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesType = !typeFilter || opp.type === typeFilter;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Urgent": return "destructive";
      case "Available": return "default";
      case "Closing Soon": return "secondary";
      default: return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <UniversalNav />
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UniversalNav />
      
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Job Opportunities
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Find your next trucking opportunity with competitive rates and reliable freight
            </p>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Input
              placeholder="Location (city, state)"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Route Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="Long Haul">Long Haul</SelectItem>
                <SelectItem value="Regional">Regional</SelectItem>
                <SelectItem value="Local">Local</SelectItem>
                <SelectItem value="Dedicated">Dedicated</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {filteredOpportunities.length} opportunities
            </p>
          </div>

          {/* Opportunities Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <CardTitle className="text-xl mb-1">{opportunity.title}</CardTitle>
                      <CardDescription className="text-base font-medium">
                        {opportunity.company}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(opportunity.status)}>
                      {opportunity.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Route Information */}
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>{opportunity.origin} → {opportunity.destination}</span>
                    </div>
                    
                    {/* Payment Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-semibold">{opportunity.rate}</div>
                          <div className="text-gray-500">{opportunity.ratePerMile}/mile</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-purple-600" />
                        <div>
                          <div className="font-semibold">{opportunity.equipment}</div>
                          <div className="text-gray-500">{opportunity.distance}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dates */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span>
                        Load: {opportunity.loadDate} | Deliver: {opportunity.deliveryDate}
                      </span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {opportunity.description}
                    </p>
                    
                    {/* Requirements */}
                    <div>
                      <div className="text-sm font-medium mb-2">Requirements:</div>
                      <div className="flex flex-wrap gap-1">
                        {opportunity.requirements.map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOpportunities.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No opportunities found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}