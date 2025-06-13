import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UniversalNav } from "@/components/UniversalNav";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { 
  Truck, 
  MapPin, 
  Clock, 
  Star, 
  Users, 
  DollarSign,
  Building2,
  Calendar,
  Shield,
  Phone,
  Plus
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  
  // Fetch contractor profile
  const { data: contractor } = useQuery({
    queryKey: ['/api/contractors/profile'],
    enabled: !!user,
  });

  // Fetch available opportunities  
  const { data: opportunities } = useQuery({
    queryKey: ['/api/opportunities'],
    enabled: !!user,
  });

  // Fetch recent messages
  const { data: messages } = useQuery({
    queryKey: ['/api/messages'],
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <UniversalNav />
      
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to Choose 2 ACHIEVEMOR
              </h1>
              <p className="text-gray-600 mt-2">
                Your contractor platform for connecting with opportunities
              </p>
            </div>
            {!contractor && (
              <Link href="/onboarding">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Complete Setup
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {contractor && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Trust Rating</p>
                    <p className="text-2xl font-bold">
                      {contractor.trustRating || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Earnings</p>
                    <p className="text-2xl font-bold">
                      ${contractor.totalEarnings || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Truck className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Jobs Completed</p>
                    <p className="text-2xl font-bold">
                      {contractor.completedJobs || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Partners</p>
                    <p className="text-2xl font-bold">
                      {contractor.activePartners || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Opportunities */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Available Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {opportunities && opportunities.length > 0 ? (
                  <div className="space-y-4">
                    {opportunities.slice(0, 5).map((opportunity: any) => (
                      <div key={opportunity.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{opportunity.title}</h3>
                          <Badge variant="secondary">
                            ${opportunity.payRate}/hr
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {opportunity.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {opportunity.schedule}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">
                          {opportunity.description}
                        </p>
                        <div className="flex justify-between items-center mt-3">
                          <Badge variant="outline">
                            {opportunity.vehicleType}
                          </Badge>
                          <Button size="sm">Apply Now</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No opportunities available</p>
                    <p className="text-sm text-gray-500">
                      Complete your profile to see matching opportunities
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Messages */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Manage Profile
                  </Button>
                </Link>
                <Link href="/driver-location">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Update Location
                  </Button>
                </Link>
                <Link href="/glovebox">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule & Docs
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Recent Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {messages && messages.length > 0 ? (
                  <div className="space-y-3">
                    {messages.slice(0, 3).map((message: any) => (
                      <div key={message.id} className="border-b pb-3 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm">{message.fromCompany}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {message.content.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Phone className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No messages yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}