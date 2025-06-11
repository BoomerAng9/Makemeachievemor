import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Coffee, Truck, Building2, Users } from "lucide-react";
import { Link } from "wouter";
import { UniversalNav } from "@/components/UniversalNav";

const plans = [
  {
    id: "coffee",
    name: "Buy-Me-A-Coffee",
    price: 4.30,
    setupFee: 0,
    icon: Coffee,
    description: "Solo drivers & micro-firms",
    features: [
      "Post 3 jobs per month",
      "1 active load",
      "Doc locker 250 MB",
      "Basic support"
    ],
    badge: "Popular",
    badgeColor: "bg-orange-500"
  },
  {
    id: "standard",
    name: "Standard",
    price: 29.99,
    setupFee: 199,
    icon: Truck,
    description: "Growing carriers (1-5 trucks)",
    features: [
      "Unlimited job posts",
      "3 active loads",
      "Basic AI insights",
      "Glove Box 2 GB",
      "Email support"
    ],
    badge: "Best Value",
    badgeColor: "bg-blue-500"
  },
  {
    id: "professional",
    name: "Professional",
    price: 59.99,
    setupFee: 399,
    icon: Building2,
    description: "Regional fleets (6-15 units)",
    features: [
      "10 active loads",
      "Route analytics",
      "Compliance alerts",
      "Multi-user dashboard",
      "Priority support",
      "Advanced reporting"
    ],
    badge: "Pro",
    badgeColor: "bg-purple-500"
  },
  {
    id: "owner-operator",
    name: "Owner-Operator Hub",
    price: 99.99,
    setupFee: 799,
    icon: Users,
    description: "Firms that sub-contract under their own authority",
    features: [
      "White-label portal",
      "Sub-account management",
      "Revenue share reports",
      "Priority support",
      "Custom branding",
      "Dedicated account manager"
    ],
    badge: "Enterprise",
    badgeColor: "bg-green-500"
  }
];

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <UniversalNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start with our flexible pricing tiers designed to grow with your business. 
            From solo drivers to enterprise fleets, we have the right solution for you.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-8 space-x-4">
            <span className={`text-sm ${billingPeriod === "monthly" ? "text-gray-900 font-medium" : "text-gray-500"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annual" : "monthly")}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === "annual" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm ${billingPeriod === "annual" ? "text-gray-900 font-medium" : "text-gray-500"}`}>
              Annual
              <Badge className="ml-2 bg-green-100 text-green-800">Save 20%</Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const monthlyPrice = billingPeriod === "annual" ? plan.price * 0.8 : plan.price;
            
            return (
              <Card key={plan.id} className="relative hover:shadow-lg transition-shadow">
                {plan.badge && (
                  <Badge className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${plan.badgeColor} text-white`}>
                    {plan.badge}
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    <div className="text-3xl font-bold text-gray-900">
                      ${monthlyPrice.toFixed(2)}
                      <span className="text-lg font-normal text-gray-500">/mo</span>
                    </div>
                    {plan.setupFee > 0 && (
                      <div className="text-sm text-gray-500 mt-1">
                        ${plan.setupFee} setup fee
                      </div>
                    )}
                    {billingPeriod === "annual" && (
                      <div className="text-sm text-green-600 mt-1">
                        Save ${((plan.price * 0.2) * 12).toFixed(0)}/year
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button asChild className="w-full">
                    <Link href={`/checkout?plan=${plan.id}&billing=${billingPeriod}`}>
                      Get Started
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enterprise Contact */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Need a Custom Solution?
              </h3>
              <p className="text-gray-600 mb-6">
                For large fleets, custom integrations, or enterprise requirements, 
                let's discuss a tailored solution that fits your specific needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline">
                  <a href="tel:912-742-9459">Call (912) 742-9459</a>
                </Button>
                <Button asChild>
                  <a href="mailto:contactus@achievemor.io">Contact Sales</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}