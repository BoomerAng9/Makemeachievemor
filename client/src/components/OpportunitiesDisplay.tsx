import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Users, Heart, Package, MapPin, Clock, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Opportunity {
  id: string;
  title: string;
  origin: string;
  destination: string;
  miles: string;
  rate: string;
  status: string;
  description: string;
  postedBy: string;
  deadline: string;
  loadType: string;
  vehicleRequired: string;
  serviceType: string;
}

const getServiceIcon = (serviceType: string) => {
  switch (serviceType) {
    case 'freight':
      return <Truck className="h-4 w-4" />;
    case 'passenger':
      return <Users className="h-4 w-4" />;
    case 'medical':
      return <Heart className="h-4 w-4" />;
    case 'delivery':
    case 'specialized':
      return <Package className="h-4 w-4" />;
    case 'entertainment':
      return <Users className="h-4 w-4" />;
    default:
      return <Truck className="h-4 w-4" />;
  }
};

const getServiceColor = (serviceType: string) => {
  switch (serviceType) {
    case 'freight':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'passenger':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'delivery':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'specialized':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'entertainment':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'urgent':
      return 'bg-red-500 text-white';
    case 'active':
      return 'bg-green-500 text-white';
    case 'available':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export function OpportunitiesDisplay() {
  const { data: opportunities, isLoading } = useQuery<Opportunity[]>({
    queryKey: ['/api/opportunities'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Available Opportunities</h2>
          <p className="text-muted-foreground">Diverse transportation services across all sectors</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {opportunities?.length || 0} opportunities
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities?.map((opportunity) => (
          <Card key={opportunity.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 line-clamp-2">
                    {opportunity.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`text-xs ${getServiceColor(opportunity.serviceType)}`}>
                      {getServiceIcon(opportunity.serviceType)}
                      <span className="ml-1 capitalize">{opportunity.serviceType}</span>
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(opportunity.status)}`}>
                      {opportunity.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{opportunity.origin}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">{opportunity.destination}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{opportunity.miles} miles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-green-600">${opportunity.rate}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Vehicle Required:</p>
                <p className="font-medium">{opportunity.vehicleRequired}</p>
              </div>
              
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Description:</p>
                <p className="line-clamp-2">{opportunity.description}</p>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>Posted by: {opportunity.postedBy}</p>
                <p>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</p>
              </div>
              
              <Button className="w-full" size="sm">
                Accept Opportunity
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {(!opportunities || opportunities.length === 0) && (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No opportunities available</h3>
          <p className="text-muted-foreground">Check back later for new transportation opportunities</p>
        </div>
      )}
    </div>
  );
}