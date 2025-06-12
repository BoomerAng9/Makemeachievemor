import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Zap, Building, Shield, Star } from "lucide-react";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "monthly" | "yearly";
  features: string[];
  recommended?: boolean;
  userType: "contractor" | "company" | "enterprise";
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "contractor_basic",
    name: "Basic Driver",
    description: "Essential tools for independent contractors",
    price: 29,
    interval: "monthly",
    userType: "contractor",
    features: [
      "Job opportunity matching",
      "Basic document storage (5GB)",
      "Mobile app access",
      "Standard support",
      "Basic analytics",
      "Email notifications"
    ]
  },
  {
    id: "contractor_professional",
    name: "Professional Driver",
    description: "Advanced features for serious professionals",
    price: 79,
    interval: "monthly",
    userType: "contractor",
    recommended: true,
    features: [
      "Everything in Basic",
      "Priority job matching",
      "Enhanced document storage (25GB)",
      "Advanced analytics & insights",
      "AI-powered recommendations",
      "Background check management",
      "Route optimization",
      "24/7 priority support",
      "Dedicated contractor benefits"
    ]
  },
  {
    id: "contractor_premium",
    name: "Elite Driver",
    description: "Premium experience with exclusive benefits",
    price: 149,
    interval: "monthly",
    userType: "contractor",
    features: [
      "Everything in Professional",
      "Exclusive high-paying opportunities",
      "Unlimited document storage",
      "Personal account manager",
      "Advanced compliance tools",
      "Custom branding options",
      "API access",
      "White-glove onboarding",
      "Industry networking events"
    ]
  },
  {
    id: "company_basic",
    name: "Startup Fleet",
    description: "Perfect for small logistics companies",
    price: 199,
    interval: "monthly",
    userType: "company",
    features: [
      "Up to 10 active job postings",
      "Basic contractor matching",
      "Standard support",
      "Basic reporting",
      "Email integration",
      "Mobile access"
    ]
  },
  {
    id: "company_professional", 
    name: "Growing Business",
    description: "Scalable solution for expanding companies",
    price: 499,
    interval: "monthly",
    userType: "company",
    recommended: true,
    features: [
      "Unlimited job postings",
      "Advanced contractor matching",
      "Dedicated relationship manager",
      "Advanced analytics & reporting",
      "API access",
      "Custom integration support",
      "Priority contractor access",
      "24/7 support",
      "Bulk operations"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solution for large organizations",
    price: 0, // Custom pricing
    interval: "monthly",
    userType: "enterprise",
    features: [
      "Everything in Growing Business",
      "Custom pricing",
      "Dedicated infrastructure",
      "Advanced security features",
      "Custom integrations",
      "SLA guarantees",
      "Training & consultation",
      "Multi-tenant management",
      "Custom reporting"
    ]
  }
];

interface PaymentFormProps {
  plan: SubscriptionPlan;
  clientSecret: string;
  onSuccess: () => void;
}

function PaymentForm({ plan, clientSecret, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/dashboard",
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Subscription Activated",
        description: `Welcome to ${plan.name}! Your subscription is now active.`,
      });
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? "Processing..." : `Subscribe to ${plan.name}`}
      </Button>
    </form>
  );
}

interface SubscriptionPlansProps {
  userType: "contractor" | "company";
  onSubscriptionComplete?: () => void;
}

export function SubscriptionPlans({ userType, onSubscriptionComplete }: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current subscription if any
  const { data: currentSubscription } = useQuery({
    queryKey: ["/api/subscription/current"],
    retry: false
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest("POST", "/api/subscription/create", { planId });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive"
      });
    }
  });

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (plan.price === 0) {
      // Enterprise plan - redirect to contact
      window.location.href = "/contact?plan=enterprise";
      return;
    }
    
    setSelectedPlan(plan);
    createSubscriptionMutation.mutate(plan.id);
  };

  const handleSubscriptionSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/subscription/current"] });
    setSelectedPlan(null);
    setClientSecret("");
    onSubscriptionComplete?.();
  };

  const filteredPlans = SUBSCRIPTION_PLANS.filter(plan => 
    plan.userType === userType || plan.userType === "enterprise"
  );

  const getPlanIcon = (userType: string) => {
    switch (userType) {
      case "contractor": return <Zap className="w-6 h-6" />;
      case "company": return <Building className="w-6 h-6" />;
      case "enterprise": return <Crown className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  if (selectedPlan && clientSecret) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Complete Your Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="font-semibold">{selectedPlan.name}</h3>
              <p className="text-gray-600">${selectedPlan.price}/{selectedPlan.interval}</p>
            </div>
            
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#3b82f6',
                  }
                }
              }}
            >
              <PaymentForm 
                plan={selectedPlan}
                clientSecret={clientSecret}
                onSuccess={handleSubscriptionSuccess}
              />
            </Elements>

            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedPlan(null);
                setClientSecret("");
              }}
              className="w-full mt-4"
            >
              Back to Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the plan that best fits your needs. Upgrade or downgrade anytime.
        </p>
      </div>

      {currentSubscription && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>
            You currently have an active subscription: <strong>{currentSubscription.tier}</strong>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.recommended ? 'ring-2 ring-primary shadow-lg' : ''}`}
          >
            {plan.recommended && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                Recommended
              </Badge>
            )}
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getPlanIcon(plan.userType)}
                {plan.name}
              </CardTitle>
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {plan.price === 0 ? "Custom" : `$${plan.price}`}
                  {plan.price > 0 && <span className="text-lg font-normal text-gray-600">/{plan.interval}</span>}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => handlePlanSelect(plan)}
                disabled={createSubscriptionMutation.isPending}
                className="w-full"
                variant={plan.recommended ? "default" : "outline"}
              >
                {plan.price === 0 ? "Contact Sales" : 
                 createSubscriptionMutation.isPending ? "Setting up..." : "Get Started"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          All plans include our commitment-based platform with zero tolerance for ghosting.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            SOC 2 Compliant
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4" />
            Cancel Anytime
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            24/7 Support
          </span>
        </div>
      </div>
    </div>
  );
}