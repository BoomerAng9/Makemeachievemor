import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { 
  Shield, 
  Users, 
  Building2, 
  Truck, 
  DollarSign, 
  Settings, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Star,
  TrendingUp
} from "lucide-react";

export default function AdminPanel() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/admin/dashboard', refreshTrigger],
    queryFn: async () => {
      // Mock admin dashboard data for comprehensive view
      return {
        totalUsers: 1247,
        activeDrivers: 892,
        activeCompanies: 156,
        totalJobs: 3421,
        completedJobs: 2987,
        pendingVerifications: 23,
        systemHealth: 'healthy',
        revenue: 127500,
        recentActivity: [
          { id: 1, type: 'registration', user: 'John Smith', timestamp: new Date(), details: 'New driver registration' },
          { id: 2, type: 'job_completion', user: 'ABC Logistics', timestamp: new Date(), details: 'Load ATL-MIA completed' },
          { id: 3, type: 'verification', user: 'Mike Johnson', timestamp: new Date(), details: 'Background check approved' },
          { id: 4, type: 'payment', user: 'XYZ Transport', timestamp: new Date(), details: 'Subscription payment received' },
        ],
        systemAlerts: [
          { id: 1, type: 'warning', message: 'High SMS usage this month', timestamp: new Date() },
          { id: 2, type: 'info', message: '5 new companies pending approval', timestamp: new Date() },
        ]
      };
    }
  });

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation title="Admin Panel" />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: dashboardData?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Active Drivers",
      value: dashboardData?.activeDrivers || 0,
      icon: Truck,
      color: "bg-green-500",
    },
    {
      title: "Active Companies",
      value: dashboardData?.activeCompanies || 0,
      icon: Building2,
      color: "bg-purple-500",
    },
    {
      title: "Monthly Revenue",
      value: `$${(dashboardData?.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation title="Admin Control Panel" />
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              ACHIEVEMOR Platform Management
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={dashboardData?.systemHealth === 'healthy' ? 'default' : 'destructive'}>
              {dashboardData?.systemHealth === 'healthy' ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  System Healthy
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  System Issues
                </>
              )}
            </Badge>
            <Button onClick={refreshData} variant="outline" size="sm">
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="flex items-center p-6">
                <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.recentActivity?.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{activity.user}</p>
                          <p className="text-sm text-gray-600">{activity.details}</p>
                        </div>
                        <Badge variant="outline">
                          {activity.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    System Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.systemAlerts?.map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {alert.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="w-6 h-6 mb-2" />
                    <span>Manage Users</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <FileText className="w-6 h-6 mb-2" />
                    <span>View Reports</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Settings className="w-6 h-6 mb-2" />
                    <span>Global Settings</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Shield className="w-6 h-6 mb-2" />
                    <span>Security</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage drivers, companies, and administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 border rounded-lg">
                    <Truck className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                    <h3 className="text-lg font-semibold mb-2">Drivers</h3>
                    <p className="text-3xl font-bold text-blue-600">{dashboardData?.activeDrivers}</p>
                    <p className="text-sm text-gray-600 mt-2">Active independent contractors</p>
                  </div>
                  <div className="text-center p-6 border rounded-lg">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-semibold mb-2">Companies</h3>
                    <p className="text-3xl font-bold text-green-600">{dashboardData?.activeCompanies}</p>
                    <p className="text-sm text-gray-600 mt-2">Partner companies</p>
                  </div>
                  <div className="text-center p-6 border rounded-lg">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                    <h3 className="text-lg font-semibold mb-2">Admins</h3>
                    <p className="text-3xl font-bold text-purple-600">5</p>
                    <p className="text-sm text-gray-600 mt-2">System administrators</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Management</CardTitle>
                <CardDescription>
                  Monitor load opportunities and assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700">Total Jobs</h4>
                    <p className="text-2xl font-bold text-blue-600">{dashboardData?.totalJobs}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700">Completed</h4>
                    <p className="text-2xl font-bold text-green-600">{dashboardData?.completedJobs}</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-700">In Progress</h4>
                    <p className="text-2xl font-bold text-yellow-600">
                      {(dashboardData?.totalJobs || 0) - (dashboardData?.completedJobs || 0)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700">Success Rate</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(((dashboardData?.completedJobs || 0) / (dashboardData?.totalJobs || 1)) * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Settings</CardTitle>
                <CardDescription>
                  Configure platform-wide settings and integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Platform Configuration
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Pricing & Subscriptions
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Maps & Location Services
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Security & Authentication
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Business intelligence and platform metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Revenue Reports</h4>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Monthly Revenue Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Subscription Analytics
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">User Reports</h4>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      User Growth Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Star className="w-4 h-4 mr-2" />
                      Performance Metrics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Monitor system performance and service status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Database</span>
                      <Badge className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">SMS Service</span>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Payment Processing</span>
                      <Badge className="bg-green-500">Operational</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Google Maps API</span>
                      <Badge className="bg-green-500">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Background Checks</span>
                      <Badge className="bg-green-500">Available</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">AI Insights</span>
                      <Badge className="bg-green-500">Running</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}