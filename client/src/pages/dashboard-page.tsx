import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  MapPin, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  Package,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

// Sample data for demonstration
const sampleDocuments = [
  { id: 1, name: "Commercial Driver License", type: "license", status: "active", expiryDate: "2025-12-15" },
  { id: 2, name: "DOT Medical Certificate", type: "medical", status: "active", expiryDate: "2025-08-30" },
  { id: 3, name: "Insurance Certificate", type: "insurance", status: "pending", expiryDate: "2025-06-01" },
  { id: 4, name: "Vehicle Registration", type: "registration", status: "active", expiryDate: "2025-11-20" },
];

const sampleOpportunities = [
  { id: 1, title: "Atlanta to Nashville", rate: "$2,400", miles: "240", type: "Flatbed", urgency: "high" },
  { id: 2, title: "Memphis to Birmingham", rate: "$1,800", miles: "180", type: "Dry Van", urgency: "medium" },
  { id: 3, title: "Charlotte to Jacksonville", rate: "$3,200", miles: "320", type: "Refrigerated", urgency: "low" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-800";
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "expired": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case "high": return "bg-red-100 text-red-800";
    case "medium": return "bg-yellow-100 text-yellow-800";
    case "low": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Back Button */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Dashboard - {user?.firstName || 'User'}'s Glovebox
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">4</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Documents</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">$7,400</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Available Jobs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">3</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Opportunities</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">92%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Compliance</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Management
                </CardTitle>
                <CardDescription>
                  Manage your important trucking documents and certifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-gray-600">Expires: {doc.expiryDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Link href="/glovebox">
                    <Button className="w-full">
                      <Package className="h-4 w-4 mr-2" />
                      Open Glovebox
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Available Opportunities
                </CardTitle>
                <CardDescription>
                  Explore new job opportunities and routes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleOpportunities.map((opp) => (
                    <div key={opp.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-8 w-8 text-purple-600" />
                        <div>
                          <div className="font-medium">{opp.title}</div>
                          <div className="text-sm text-gray-600">{opp.type} • {opp.miles} miles</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getUrgencyColor(opp.urgency)}>
                          {opp.urgency}
                        </Badge>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{opp.rate}</div>
                          <Button variant="outline" size="sm" className="mt-1">
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
                <CardDescription>
                  Track your compliance status and upcoming requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Compliance Score</span>
                    <span className="text-2xl font-bold text-green-600">92%</span>
                  </div>
                  <Progress value={92} className="w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Documents Up to Date</span>
                    </div>
                    <div className="text-sm text-gray-600">3 of 4 documents current</div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">Pending Renewals</span>
                    </div>
                    <div className="text-sm text-gray-600">1 document needs attention</div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Action Required</span>
                  </div>
                  <div className="text-sm text-yellow-700">
                    Insurance Certificate expires in 30 days. Please renew to maintain compliance.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Jobs Completed This Month</span>
                    <span className="font-bold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Earnings</span>
                    <span className="font-bold text-green-600">$18,400</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Miles Driven</span>
                    <span className="font-bold">12,480</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fuel Efficiency</span>
                    <span className="font-bold">6.8 MPG</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div>
                        <div className="font-medium">Delivery - Birmingham</div>
                        <div className="text-sm text-gray-600">Tomorrow, 9:00 AM</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div>
                        <div className="font-medium">DOT Inspection</div>
                        <div className="text-sm text-gray-600">Friday, 2:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      <div>
                        <div className="font-medium">License Renewal</div>
                        <div className="text-sm text-gray-600">Next Monday</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}