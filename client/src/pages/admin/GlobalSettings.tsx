import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  DollarSign, 
  Mail, 
  Phone, 
  Globe, 
  Shield, 
  Database,
  Bell,
  Users,
  Truck,
  Building2,
  Save,
  RefreshCw
} from "lucide-react";

const globalSettingsSchema = z.object({
  // Platform Settings
  platformName: z.string().min(1, "Platform name is required"),
  platformDescription: z.string().optional(),
  supportEmail: z.string().email("Valid email required"),
  supportPhone: z.string().min(10, "Valid phone number required"),
  
  // Pricing Settings
  coffeeTierPrice: z.string().min(1, "Price required"),
  standardTierPrice: z.string().min(1, "Price required"),
  professionalTierPrice: z.string().min(1, "Price required"),
  ownerOperatorTierPrice: z.string().min(1, "Price required"),
  
  // Feature Flags
  enableSmsAuth: z.boolean(),
  enableStripePayments: z.boolean(),
  enableBackgroundChecks: z.boolean(),
  enableGoogleMaps: z.boolean(),
  enableAiInsights: z.boolean(),
  
  // Business Rules
  maxActiveLoadsBasic: z.string().min(1, "Must be a number"),
  maxActiveLoadsStandard: z.string().min(1, "Must be a number"),
  maxActiveLoadsProfessional: z.string().min(1, "Must be a number"),
  jobLockTimeoutMinutes: z.string().min(1, "Must be a number"),
  
  // Email Templates
  welcomeEmailTemplate: z.string().optional(),
  verificationEmailTemplate: z.string().optional(),
  
  // API Keys (hidden in UI, just labels)
  stripeConfigured: z.boolean(),
  twilioConfigured: z.boolean(),
  googleMapsConfigured: z.boolean(),
  openaiConfigured: z.boolean(),
});

type GlobalSettingsFormData = z.infer<typeof globalSettingsSchema>;

export default function GlobalSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("platform");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
  });

  const form = useForm<GlobalSettingsFormData>({
    resolver: zodResolver(globalSettingsSchema),
    defaultValues: {
      platformName: "Choose 2 ACHIEVEMOR",
      platformDescription: "Peer - 2 - Peer Deployment Platform",
      supportEmail: "contactus@achievemor.io",
      supportPhone: "912-742-9459",
      coffeeTierPrice: "4.30",
      standardTierPrice: "29.99",
      professionalTierPrice: "59.99",
      ownerOperatorTierPrice: "99.99",
      enableSmsAuth: true,
      enableStripePayments: true,
      enableBackgroundChecks: true,
      enableGoogleMaps: true,
      enableAiInsights: true,
      maxActiveLoadsBasic: "1",
      maxActiveLoadsStandard: "3",
      maxActiveLoadsProfessional: "10",
      jobLockTimeoutMinutes: "5",
      welcomeEmailTemplate: "Welcome to ACHIEVEMOR! Your account has been created successfully.",
      verificationEmailTemplate: "Please verify your account by clicking the link below.",
      stripeConfigured: false,
      twilioConfigured: false,
      googleMapsConfigured: false,
      openaiConfigured: false,
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: GlobalSettingsFormData) => {
      return apiRequest("/api/admin/settings", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Settings Updated",
        description: "Global settings have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const testServiceMutation = useMutation({
    mutationFn: async (service: string) => {
      return apiRequest(`/api/admin/test-service/${service}`, "POST");
    },
    onSuccess: (data, service) => {
      toast({
        title: "Service Test",
        description: `${service} service is working correctly.`,
      });
    },
    onError: (error: any, service) => {
      toast({
        title: "Service Test Failed",
        description: `${service} service test failed: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GlobalSettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation title="Global Settings" />
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation title="Global Settings" />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Settings</h1>
          <p className="text-gray-600">Configure platform-wide settings and features</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="platform">Platform</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="business">Business Rules</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
              </TabsList>

              <TabsContent value="platform" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5" />
                      <span>Platform Configuration</span>
                    </CardTitle>
                    <CardDescription>Basic platform information and branding</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="platformName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="platformDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="supportEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Support Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="supportPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Support Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Subscription Pricing</span>
                    </CardTitle>
                    <CardDescription>Configure pricing tiers for all subscription plans</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="coffeeTierPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coffee Tier ($)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="standardTierPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Standard Tier ($)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="professionalTierPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Tier ($)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ownerOperatorTierPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Owner-Operator Tier ($)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Feature Flags</span>
                    </CardTitle>
                    <CardDescription>Enable or disable platform features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="enableSmsAuth"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>SMS Authentication</FormLabel>
                              <p className="text-sm text-gray-500">Enable phone-based login</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="enableStripePayments"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Stripe Payments</FormLabel>
                              <p className="text-sm text-gray-500">Enable subscription billing</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="enableBackgroundChecks"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Background Checks</FormLabel>
                              <p className="text-sm text-gray-500">Automated verification</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="enableGoogleMaps"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Google Maps Integration</FormLabel>
                              <p className="text-sm text-gray-500">Location services</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="enableAiInsights"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>AI Insights</FormLabel>
                              <p className="text-sm text-gray-500">OpenAI-powered features</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="business" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Business Rules</span>
                    </CardTitle>
                    <CardDescription>Configure platform limits and constraints</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="maxActiveLoadsBasic"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coffee Tier Max Loads</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="maxActiveLoadsStandard"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Standard Tier Max Loads</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="maxActiveLoadsProfessional"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Tier Max Loads</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="jobLockTimeoutMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Lock Timeout (Minutes)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <p className="text-sm text-gray-500">
                            How long a job request is locked before becoming available again
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <span>Email Templates</span>
                    </CardTitle>
                    <CardDescription>Customize automated email content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="welcomeEmailTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Welcome Email Template</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="verificationEmailTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Email Template</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="h-5 w-5" />
                      <span>External Services</span>
                    </CardTitle>
                    <CardDescription>Monitor and test external service integrations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Stripe</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testServiceMutation.mutate("stripe")}
                            disabled={testServiceMutation.isPending}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Test
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">Payment processing service</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Twilio</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testServiceMutation.mutate("twilio")}
                            disabled={testServiceMutation.isPending}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Test
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">SMS authentication service</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Google Maps</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testServiceMutation.mutate("googlemaps")}
                            disabled={testServiceMutation.isPending}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Test
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">Location and mapping service</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">OpenAI</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testServiceMutation.mutate("openai")}
                            disabled={testServiceMutation.isPending}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Test
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">AI insights and automation</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end mt-8">
              <Button 
                type="submit" 
                disabled={updateSettingsMutation.isPending}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}