import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Rocket, TrendingUp, Zap, Shield, HeadphonesIcon, CheckCircle } from "lucide-react";
import { ConsultationForm } from "./ConsultationForm";

interface ConsultationButtonProps {
  type: 'contractor' | 'company';
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export function ConsultationButton({ type, variant = 'default', size = 'default' }: ConsultationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const contractorServices = [
    {
      title: "Business Setup & Registration",
      description: "Complete business formation, MC Authority, DOT registration, and legal compliance setup",
      icon: <Building2 className="h-6 w-6 text-blue-600" />,
      features: ["LLC/Corporation Formation", "MC Authority Application", "DOT Registration", "Insurance Setup", "Tax Planning"]
    },
    {
      title: "Growth & Scaling Solutions", 
      description: "Strategic planning, fleet expansion, route optimization, and revenue growth strategies",
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      features: ["Fleet Expansion Planning", "Route Optimization", "Load Board Integration", "Financial Planning", "Market Analysis"]
    },
    {
      title: "Complete Business Automation",
      description: "End-to-end automation of dispatch, billing, compliance, and operational workflows",
      icon: <Zap className="h-6 w-6 text-amber-600" />,
      features: ["Automated Dispatch", "Digital Load Boards", "Compliance Monitoring", "Automated Billing", "Performance Analytics"]
    },
    {
      title: "Marketing & Brand Development",
      description: "Professional branding, digital marketing, social media management, and customer acquisition",
      icon: <Rocket className="h-6 w-6 text-purple-600" />,
      features: ["Brand Development", "Website Creation", "Social Media Marketing", "Load Board Presence", "Customer Acquisition"]
    }
  ];

  const companyServices = [
    {
      title: "Dedicated Driver Network",
      description: "Access to pre-vetted, experienced owner-operators with complete compliance verification",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      features: ["Vetted Driver Pool", "Instant Availability", "Compliance Verified", "Insurance Validated", "Performance Tracked"]
    },
    {
      title: "Logistics Management Platform",
      description: "Complete transportation management system with real-time tracking and optimization",
      icon: <Shield className="h-6 w-6 text-green-600" />,
      features: ["Real-time Tracking", "Route Optimization", "Load Matching", "Automated Dispatch", "Performance Analytics"]
    },
    {
      title: "Digital Transformation",
      description: "Modernize operations with AI-powered automation, data analytics, and workflow optimization",
      icon: <Zap className="h-6 w-6 text-amber-600" />,
      features: ["AI-Powered Analytics", "Workflow Automation", "Digital Integration", "Cost Optimization", "Scalable Solutions"]
    },
    {
      title: "24/7 Operations Support",
      description: "Round-the-clock operational support, emergency response, and dedicated account management",
      icon: <HeadphonesIcon className="h-6 w-6 text-purple-600" />,
      features: ["24/7 Support", "Emergency Response", "Dedicated Account Manager", "Training & Onboarding", "Continuous Optimization"]
    }
  ];

  const services = type === 'contractor' ? contractorServices : companyServices;
  const buttonText = type === 'contractor' ? 'Grow My Business' : 'Get Dedicated Drivers';
  const headerTitle = type === 'contractor' ? 'Scale Your Trucking Business' : 'Enterprise Logistics Solutions';
  const headerDescription = type === 'contractor' 
    ? 'Let ACHIEVEMOR help you build, grow, and automate your owner-operator business for maximum profitability and efficiency.'
    : 'Partner with ACHIEVEMOR for dedicated drivers, logistics management, and complete digital transformation of your operations.';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          <span className="relative font-semibold">{buttonText}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-6">
          <DialogTitle className="text-3xl font-bold text-center text-gray-900">
            {headerTitle}
          </DialogTitle>
          <DialogDescription className="text-lg text-center text-gray-600 max-w-4xl mx-auto">
            {headerDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-amber-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-amber-50 transition-colors">
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-2">
                        {service.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Value Proposition */}
          <div className="bg-gradient-to-r from-gray-50 to-amber-50 rounded-2xl p-8 border border-amber-100">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {type === 'contractor' ? 'Why Choose ACHIEVEMOR?' : 'Why Partner with ACHIEVEMOR?'}
              </h3>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">98%</div>
                  <div className="text-sm text-gray-600">
                    {type === 'contractor' ? 'Success Rate' : 'Client Satisfaction'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">24/7</div>
                  <div className="text-sm text-gray-600">Support Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">500+</div>
                  <div className="text-sm text-gray-600">
                    {type === 'contractor' ? 'Businesses Launched' : 'Companies Served'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Form */}
          <div className="border-t pt-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Get Started?</h3>
              <p className="text-gray-600">
                Fill out the form below and our experts will contact you within 24 hours to discuss your specific needs.
              </p>
            </div>
            <ConsultationForm type={type} onSuccess={() => setIsOpen(false)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}