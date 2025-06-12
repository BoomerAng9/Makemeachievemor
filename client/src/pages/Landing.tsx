import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Truck, 
  MapPin, 
  Shield, 
  Clock, 
  DollarSign,
  Users,
  Star,
  ArrowRight
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Truck className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Achievemor
            </span>
          </div>
          <Button onClick={handleLogin} className="flex items-center gap-2">
            Sign In with Replit
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Connect Contractors with Companies
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            A comprehensive platform for owner-operator independent contractors 
            in the trucking industry, featuring intelligent matching, location services, 
            and relationship-based pricing.
          </p>
          <Button 
            onClick={handleLogin} 
            size="lg" 
            className="text-lg px-8 py-3 flex items-center gap-2 mx-auto"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Platform Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: MapPin,
              title: "Location Services",
              description: "Real-time GPS tracking and route optimization with Google Maps integration"
            },
            {
              icon: Shield,
              title: "Zero Trust Security",
              description: "SOC 2.0 compliant security with device fingerprinting and compliance tracking"
            },
            {
              icon: Clock,
              title: "Availability Tracking",
              description: "Smart scheduling system with availability preferences and mile limits"
            },
            {
              icon: DollarSign,
              title: "Dynamic Pricing",
              description: "Relationship-based fee reductions and transparent pricing structure"
            },
            {
              icon: Users,
              title: "Smart Matching",
              description: "AI-powered contractor-company matching based on preferences and history"
            },
            {
              icon: Star,
              title: "Performance Insights",
              description: "Comprehensive analytics and performance tracking for contractors"
            }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Icon className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                For Contractors
              </h2>
              <ul className="space-y-4">
                {[
                  "Find nearby opportunities with location-based matching",
                  "Reduced fees for consistent company relationships",
                  "Real-time availability and preference management",
                  "Comprehensive document management and compliance tracking"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                For Companies
              </h2>
              <ul className="space-y-4">
                {[
                  "Access to qualified, verified contractors",
                  "Automated compliance and background check management",
                  "Real-time location tracking and route optimization",
                  "Performance analytics and relationship insights"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Join the platform that's revolutionizing contractor-company relationships 
            in the trucking industry.
          </p>
          <Button 
            onClick={handleLogin} 
            size="lg" 
            className="text-lg px-8 py-3 flex items-center gap-2 mx-auto"
          >
            Sign In with Replit
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Truck className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Achievemor
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Connecting contractors and companies with intelligent matching and location services.
          </p>
        </div>
      </footer>
    </div>
  );
}