import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  CreditCard, 
  Building2, 
  Phone, 
  Mail, 
  Calendar,
  Crown,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";
import { Link } from "wouter";

const planDetails = {
  coffee: { 
    name: "Buy-Me-A-Coffee", 
    price: 4.30, 
    features: ["3 jobs/month", "1 active load", "250MB storage"],
    color: "bg-orange-500"
  },
  standard: { 
    name: "Standard", 
    price: 29.99, 
    features: ["Unlimited jobs", "3 active loads", "2GB storage", "AI insights"],
    color: "bg-blue-500"
  },
  professional: { 
    name: "Professional", 
    price: 59.99, 
    features: ["10 active loads", "Route analytics", "Compliance alerts", "Multi-user"],
    color: "bg-purple-500"
  },
  "owner-operator": { 
    name: "Owner-Operator Hub", 
    price: 99.99, 
    features: ["White-label portal", "Sub-accounts", "Revenue reports", "Priority support"],
    color: "bg-green-500"
  }
};

export default function AccountSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptionData } = useQuery({
    queryKey: ["/api/subscription"],
    enabled: !!user,
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (newTier: string) => {
      return apiRequest("/api/subscription/update", "POST", { tier: newTier });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/subscription/cancel", "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled. You'll retain access until the end of your billing period.",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access account settings.</p>
          <Button asChild className="mt-4">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentPlan = planDetails[user.subscriptionTier as keyof typeof planDetails] || planDetails.coffee;
  const isActive = user.subscriptionStatus === "active";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your profile and subscription</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>Your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{user.name}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <Badge variant="outline" className="w-fit">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>

                  {user.email && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  )}

                  {user.phoneNumber && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{user.phoneNumber}</span>
                      </div>
                    </div>
                  )}

                  {user.companyName && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Company</label>
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{user.companyName}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Badge 
                      variant={user.status === "active" ? "default" : "secondary"}
                      className="w-fit"
                    >
                      {user.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <div className="space-y-6">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5" />
                    <span>Current Plan</span>
                  </CardTitle>
                  <CardDescription>Your subscription details and usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{currentPlan.name}</h3>
                      <p className="text-2xl font-bold text-primary">
                        ${currentPlan.price}/month
                      </p>
                    </div>
                    <Badge className={`${currentPlan.color} text-white`}>
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-6">
                    {currentPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {user.subscriptionEndDate && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {user.subscriptionStatus === "canceled" 
                          ? `Access until ${new Date(user.subscriptionEndDate).toLocaleDateString()}`
                          : `Next billing: ${new Date(user.subscriptionEndDate).toLocaleDateString()}`
                        }
                      </span>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button asChild variant="outline">
                      <Link href="/pricing">View All Plans</Link>
                    </Button>
                    {isActive && user.subscriptionStatus !== "canceled" && (
                      <Button 
                        variant="destructive" 
                        onClick={() => cancelSubscriptionMutation.mutate()}
                        disabled={cancelSubscriptionMutation.isPending}
                      >
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Plan Upgrade Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Upgrade Options</span>
                  </CardTitle>
                  <CardDescription>Compare and upgrade to higher tiers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(planDetails).map(([tier, plan]) => {
                      const isCurrentPlan = tier === user.subscriptionTier;
                      const canUpgrade = plan.price > currentPlan.price;
                      const canDowngrade = plan.price < currentPlan.price && tier !== "coffee";

                      if (isCurrentPlan) return null;

                      return (
                        <div key={tier} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{plan.name}</h4>
                            <span className="font-bold">${plan.price}/mo</span>
                          </div>
                          
                          <div className="space-y-1">
                            {plan.features.slice(0, 2).map((feature, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                • {feature}
                              </div>
                            ))}
                          </div>

                          <Button
                            className="w-full"
                            variant={canUpgrade ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateSubscriptionMutation.mutate(tier)}
                            disabled={updateSubscriptionMutation.isPending}
                          >
                            {canUpgrade && <ArrowUpCircle className="mr-2 h-4 w-4" />}
                            {canDowngrade && <ArrowDownCircle className="mr-2 h-4 w-4" />}
                            {canUpgrade ? "Upgrade" : "Downgrade"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Billing Information</span>
                </CardTitle>
                <CardDescription>Manage your payment methods and billing history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Billing management coming soon</p>
                    <p className="text-sm">Contact support for billing inquiries</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button asChild variant="outline">
                      <a href="mailto:billing@achievemor.io">Contact Billing Support</a>
                    </Button>
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