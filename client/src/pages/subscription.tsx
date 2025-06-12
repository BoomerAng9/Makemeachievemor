import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UniversalNav } from "@/components/UniversalNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Crown, Check, X, CreditCard, Calendar, TrendingUp, AlertCircle, Shield, Zap, Users, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  stripePriceId: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Driver',
    price: 0,
    interval: 'monthly',
    stripePriceId: '',
    features: [
      'Basic document storage',
      'Job opportunity alerts',
      'Community access',
      'Mobile app access',
      'Email support'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 29,
    interval: 'monthly',
    stripePriceId: 'price_professional_monthly',
    isPopular: true,
    features: [
      'All Basic features',
      'Advanced document verification',
      'Priority job matching',
      'Background check integration',
      'AI-powered insights',
      'Social media sharing',
      'Priority support',
      'Advanced analytics'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Owner-Operator',
    price: 99,
    interval: 'monthly',
    stripePriceId: 'price_enterprise_monthly',
    features: [
      'All Professional features',
      'Authority setup assistance',
      'Business compliance tracking',
      'Fleet management tools',
      'Custom integrations',
      'Dedicated account manager',
      'Phone support',
      'Business analytics dashboard'
    ]
  }
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');

  // Fetch current subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/subscription/current'],
    retry: false,
  });

  // Fetch billing history
  const { data: billingHistory, isLoading: billingLoading } = useQuery({
    queryKey: ['/api/subscription/billing-history'],
    retry: false,
  });

  // Subscription change mutation
  const changeSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan || plan.price === 0) {
        return apiRequest("POST", "/api/subscription/downgrade", { planId });
      }
      return apiRequest("POST", "/api/subscription/upgrade", { 
        planId, 
        stripePriceId: plan.stripePriceId 
      });
    },
    onSuccess: (data) => {
      if (data.requiresPayment) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Subscription Updated",
          description: "Your subscription has been changed successfully.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/subscription/cancel");
    },
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will remain active until the end of the billing period.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const getCurrentPlan = () => {
    if (!subscription) return subscriptionPlans[0];
    return subscriptionPlans.find(p => p.id === subscription.planId) || subscriptionPlans[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <UniversalNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-gray-600 mt-2">Manage your plan, billing, and subscription preferences</p>
          </div>

          <Tabs defaultValue="plans" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="plans" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Plans
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Usage
              </TabsTrigger>
            </TabsList>

            {/* Plans Tab */}
            <TabsContent value="plans">
              <div className="space-y-6">
                {/* Current Plan Status */}
                {subscription && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Shield className="h-5 w-5" />
                        Current Plan: {getCurrentPlan().name}
                      </CardTitle>
                      <CardDescription className="text-blue-700">
                        {subscription.status === 'active' && `Next billing: ${formatDate(subscription.nextBilling)}`}
                        {subscription.status === 'cancelled' && `Expires: ${formatDate(subscription.expiresAt)}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                            {subscription.status.toUpperCase()}
                          </Badge>
                        </div>
                        {subscription.status === 'active' && getCurrentPlan().price > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => cancelSubscriptionMutation.mutate()}
                            disabled={cancelSubscriptionMutation.isPending}
                          >
                            Cancel Subscription
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Available Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {subscriptionPlans.map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`relative ${plan.isPopular ? 'border-blue-500 shadow-lg' : ''} ${
                        getCurrentPlan().id === plan.id ? 'ring-2 ring-green-500' : ''
                      }`}
                    >
                      {plan.isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-500 hover:bg-blue-600">
                            <Star className="h-3 w-3 mr-1" />
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      
                      {getCurrentPlan().id === plan.id && (
                        <div className="absolute -top-3 right-4">
                          <Badge className="bg-green-500 hover:bg-green-600">
                            <Check className="h-3 w-3 mr-1" />
                            Current
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <div className="text-3xl font-bold">
                          ${plan.price}
                          <span className="text-lg text-gray-600 font-normal">
                            /{plan.interval === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </div>
                        {plan.price === 0 && (
                          <Badge variant="secondary">Free Forever</Badge>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button 
                          className="w-full" 
                          variant={getCurrentPlan().id === plan.id ? 'outline' : 'default'}
                          disabled={getCurrentPlan().id === plan.id || changeSubscriptionMutation.isPending}
                          onClick={() => changeSubscriptionMutation.mutate(plan.id)}
                        >
                          {getCurrentPlan().id === plan.id ? 'Current Plan' : 
                           plan.price > getCurrentPlan().price ? 'Upgrade' : 'Downgrade'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing">
              <div className="space-y-6">
                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {subscription?.paymentMethod ? (
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-medium">•••• •••• •••• {subscription.paymentMethod.last4}</p>
                            <p className="text-sm text-gray-600">
                              {subscription.paymentMethod.brand.toUpperCase()} • Expires {subscription.paymentMethod.expMonth}/{subscription.paymentMethod.expYear}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No payment method on file</p>
                        <Button>Add Payment Method</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Billing History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Billing History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {billingHistory && billingHistory.length > 0 ? (
                      <div className="space-y-3">
                        {billingHistory.map((invoice: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">${formatPrice(invoice.amount)}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(invoice.date)} • {invoice.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                                {invoice.status}
                              </Badge>
                              <Button variant="outline" size="sm">
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No billing history available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Usage Tab */}
            <TabsContent value="usage">
              <div className="space-y-6">
                {/* Plan Limits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Plan Usage
                    </CardTitle>
                    <CardDescription>
                      Track your usage against plan limits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Document Storage</span>
                        <span className="text-sm text-gray-600">23 / 100 documents</span>
                      </div>
                      <Progress value={23} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Job Applications</span>
                        <span className="text-sm text-gray-600">12 / 50 this month</span>
                      </div>
                      <Progress value={24} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Background Checks</span>
                        <span className="text-sm text-gray-600">2 / 5 this month</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">AI Insights</span>
                        <span className="text-sm text-gray-600">Unlimited</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Usage Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Monthly Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">47</div>
                        <div className="text-sm text-gray-600">Documents Uploaded</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">12</div>
                        <div className="text-sm text-gray-600">Jobs Applied</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">3</div>
                        <div className="text-sm text-gray-600">Verifications</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">156</div>
                        <div className="text-sm text-gray-600">Profile Views</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upgrade Recommendations */}
                {getCurrentPlan().id === 'basic' && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-800">
                        <Zap className="h-5 w-5" />
                        Upgrade Recommendation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-orange-700">
                      <p className="mb-4">
                        You're approaching your plan limits. Upgrade to Professional for unlimited access to advanced features.
                      </p>
                      <Button onClick={() => changeSubscriptionMutation.mutate('professional')}>
                        Upgrade to Professional
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}