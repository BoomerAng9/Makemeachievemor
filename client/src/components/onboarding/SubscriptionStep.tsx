import { useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Crown, 
  Check, 
  Truck, 
  Shield, 
  Users, 
  Calendar,
  DollarSign,
  Star
} from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscriptionStepProps {
  onComplete: (subscriptionData: any) => void;
}

const CheckoutForm = ({ onComplete }: { onComplete: (data: any) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/onboarding`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast({
          title: "Subscription Activated!",
          description: "Welcome to Choose 2 ACHIEVEMOR Pro",
        });
        onComplete({
          subscriptionId: paymentIntent.id,
          status: "active",
          plan: "pro",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border rounded-lg p-4 bg-gray-50">
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Processing..." : "Activate Pro Subscription - $29.99/month"}
      </Button>
    </form>
  );
};

export function SubscriptionStep({ onComplete }: SubscriptionStepProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const features = [
    {
      icon: Truck,
      title: "Unlimited Job Access",
      description: "Access to all available loads and opportunities"
    },
    {
      icon: Shield,
      title: "Priority Support",
      description: "24/7 dedicated contractor support"
    },
    {
      icon: Users,
      title: "Direct Company Contact",
      description: "Connect directly with shippers and brokers"
    },
    {
      icon: Calendar,
      title: "Advanced Scheduling",
      description: "Smart availability management and notifications"
    },
    {
      icon: DollarSign,
      title: "Premium Rates",
      description: "Access to higher-paying exclusive loads"
    },
    {
      icon: Star,
      title: "Trust Rating Boost",
      description: "Start with enhanced trust rating for better opportunities"
    }
  ];

  const createSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/create-subscription");
      const data = await response.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPayment(true);
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showPayment && clientSecret) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Complete Your Subscription</CardTitle>
            <CardDescription>
              Secure payment powered by Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                }
              }}
            >
              <CheckoutForm onComplete={onComplete} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <Card className="border-primary">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Choose 2 ACHIEVEMOR Pro</CardTitle>
          <CardDescription>
            Everything you need to succeed as an independent contractor
          </CardDescription>
          <div className="text-center mt-4">
            <div className="text-4xl font-bold text-primary">$29.99</div>
            <div className="text-muted-foreground">per month</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{feature.title}</div>
                    <div className="text-sm text-muted-foreground">{feature.description}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Benefits */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Launch Special</span>
            </div>
            <div className="text-sm text-green-700">
              • First month free with annual plan
              • Cancel anytime - no long-term contracts
              • 30-day money-back guarantee
            </div>
          </div>

          <Button 
            onClick={createSubscription}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Setting up..." : "Start Pro Subscription"}
          </Button>

          <div className="text-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => onComplete({ plan: "trial", status: "trial" })}
              className="text-sm"
            >
              Continue with 7-day free trial
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Limited access during trial period
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="text-center text-sm text-muted-foreground">
        <Shield className="h-4 w-4 inline mr-1" />
        Secure payment processing by Stripe. Your payment information is encrypted and secure.
      </div>
    </div>
  );
}