import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Truck, 
  MapPin, 
  DollarSign, 
  Clock, 
  Package,
  Eye,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Building2
} from "lucide-react";

const opportunitySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  origin: z.string().min(3, "Origin is required"),
  destination: z.string().min(3, "Destination is required"), 
  miles: z.string().min(1, "Distance is required"),
  rate: z.string().min(1, "Rate is required"),
  description: z.string().optional(),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  urgency: z.string().default("standard"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

const planLimits = {
  coffee: { activeLoads: 1, monthlyPosts: 3 },
  standard: { activeLoads: 3, monthlyPosts: -1 },
  professional: { activeLoads: 10, monthlyPosts: -1 },
  "owner-operator": { activeLoads: -1, monthlyPosts: -1 },
};

export default function CompanyDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["/api/opportunities/company"],
    enabled: !!user && user.role === "company",
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/company/stats"],
    enabled: !!user && user.role === "company",
  });

  const form = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: "",
      origin: "",
      destination: "",
      miles: "",
      rate: "",
      description: "",
      vehicleType: "",
      urgency: "standard",
      pickupDate: "",
      deliveryDate: "",
    },
  });

  const createOpportunityMutation = useMutation({
    mutationFn: async (data: OpportunityFormData) => {
      return apiRequest("/api/opportunities", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities/company"] });
      form.reset();
      toast({
        title: "Opportunity Posted",
        description: "Your job opportunity has been posted successfully.",
      });
      setActiveTab("active");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post opportunity",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OpportunityFormData) => {
    createOpportunityMutation.mutate(data);
  };

  if (!user || user.role !== "company") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Company Access Required</h2>
          <p className="text-gray-600">This dashboard is only available to company accounts.</p>
        </div>
      </div>
    );
  }

  const userPlan = user.subscriptionTier || "coffee";
  const limits = planLimits[userPlan as keyof typeof planLimits];
  const activeLoads = opportunities?.filter((op: any) => op.status !== "closed").length || 0;
  const canPostMore = limits.activeLoads === -1 || activeLoads < limits.activeLoads;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
              <p className="text-gray-600">{user.companyName || "Your Company"}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan
              </Badge>
              <Badge variant={user.status === "active" ? "default" : "secondary"}>
                {user.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="post">Post Load</TabsTrigger>
            <TabsTrigger value="active">Active Loads</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Package className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Loads</p>
                      <p className="text-2xl font-bold">{activeLoads}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold">{stats?.completedJobs || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Truck className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Available Contractors</p>
                      <p className="text-2xl font-bold">{stats?.availableDrivers || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold">${stats?.totalSpent || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Plan Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Usage</CardTitle>
                <CardDescription>Current usage against your plan limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Active Loads</span>
                      <span>{activeLoads} / {limits.activeLoads === -1 ? "Unlimited" : limits.activeLoads}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: limits.activeLoads === -1 ? "20%" : `${Math.min((activeLoads / limits.activeLoads) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  {!canPostMore && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <span className="text-yellow-800">
                          You've reached your plan limit. Upgrade to post more loads.
                        </span>
                        <Button size="sm" asChild>
                          <a href="/pricing">Upgrade Plan</a>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="post" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post New Load</CardTitle>
                <CardDescription>Create a new job opportunity for drivers</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Delivery from Atlanta to Miami" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="vehicleType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select vehicle type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="van">Van</SelectItem>
                                <SelectItem value="box_truck">Box Truck</SelectItem>
                                <SelectItem value="semi_truck">Semi Truck</SelectItem>
                                <SelectItem value="pickup_truck">Pickup Truck</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="origin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pickup Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Atlanta, GA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="destination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Miami, FL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="miles"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Distance (miles)</FormLabel>
                            <FormControl>
                              <Input placeholder="650" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rate ($)</FormLabel>
                            <FormControl>
                              <Input placeholder="1200" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="urgency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Urgency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low Priority</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="high">High Priority</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pickupDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pickup Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Special instructions, cargo details, requirements..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={createOpportunityMutation.isPending || !canPostMore}
                    >
                      {createOpportunityMutation.isPending ? "Posting..." : "Post Load"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <div className="grid gap-4">
              {opportunities?.filter((op: any) => op.status !== "closed").map((opportunity: any) => (
                <Card key={opportunity.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{opportunity.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {opportunity.origin} → {opportunity.destination}
                          </span>
                          <span>{opportunity.miles} miles</span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${opportunity.rate}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={opportunity.status === "open" ? "default" : "secondary"}
                      >
                        {opportunity.status.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                    </div>
                    {opportunity.description && (
                      <p className="text-gray-600 mb-4">{opportunity.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Posted {new Date(opportunity.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {opportunity.status === "requested" && (
                          <Button size="sm">
                            <UserCheck className="h-4 w-4 mr-1" />
                            Review Driver
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No active loads</p>
                  <Button asChild className="mt-4">
                    <a href="#" onClick={() => setActiveTab("post")}>Post Your First Load</a>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Load history coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}