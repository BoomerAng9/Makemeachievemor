import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Check } from "lucide-react";
import { Link } from "wouter";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const checkoutSchema = z.object({
  email: z.string().email("Invalid email address"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const plans = {
  coffee: { name: "Buy-Me-A-Coffee", price: 4.30, setupFee: 0 },
  standard: { name: "Standard", price: 29.99, setupFee: 199 },
  professional: { name: "Professional", price: 59.99, setupFee: 399 },
  "owner-operator": { name: "Owner-Operator Hub", price: 99.99, setupFee: 799 },
};

function CheckoutForm({ planId, billing }: { planId: string; billing: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      companyName: "",
      firstName: "",
      lastName: "",
    },
  });

  const plan = plans[planId as keyof typeof plans];
  const annualDiscount = billing === "annual" ? 0.8 : 1;
  const monthlyPrice = plan.price * annualDiscount;
  const annualPrice = monthlyPrice * 12;

  const handleSubmit = async (data: CheckoutFormData) => {
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?subscription=success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/pricing">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pricing
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review your subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">{plan.name}</span>
              <span className="font-bold">${monthlyPrice.toFixed(2)}/mo</span>
            </div>
            
            {plan.setupFee > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Setup Fee</span>
                <span>${plan.setupFee}</span>
              </div>
            )}

            {billing === "annual" && (
              <div className="flex justify-between items-center text-green-600">
                <span>Annual Discount (20%)</span>
                <span>-${(plan.price * 0.2 * 12).toFixed(0)}/year</span>
              </div>
            )}

            <hr />
            
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total {billing === "annual" ? "Annual" : "Monthly"}</span>
              <span>
                ${billing === "annual" ? annualPrice.toFixed(2) : monthlyPrice.toFixed(2)}
                {billing === "annual" ? "/year" : "/mo"}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>24/7 support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Complete your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-6">
                  <PaymentElement />
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={!stripe || isProcessing}
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Subscribe for $${billing === "annual" ? annualPrice.toFixed(2) : monthlyPrice.toFixed(2)}${billing === "annual" ? "/year" : "/mo"}`
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Checkout() {
  const [location] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [planId, setPlanId] = useState("");
  const [billing, setBilling] = useState("monthly");

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const plan = params.get('plan') || 'standard';
    const billingPeriod = params.get('billing') || 'monthly';
    
    setPlanId(plan);
    setBilling(billingPeriod);

    // Create payment intent
    const selectedPlan = plans[plan as keyof typeof plans];
    if (selectedPlan) {
      const price = billingPeriod === "annual" ? selectedPlan.price * 0.8 * 12 : selectedPlan.price;
      const totalAmount = price + selectedPlan.setupFee;

      apiRequest("/api/create-payment-intent", "POST", { 
        amount: totalAmount,
        planId: plan,
        billing: billingPeriod 
      })
        .then((data) => setClientSecret(data.clientSecret))
        .catch(console.error);
    }
  }, [location]);

  if (!clientSecret || !planId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm planId={planId} billing={billing} />
      </Elements>
    </div>
  );
}