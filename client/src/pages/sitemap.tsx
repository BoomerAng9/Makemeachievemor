import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UniversalNav } from "@/components/UniversalNav";
import { 
  Home, 
  FileText, 
  Truck, 
  Users, 
  Settings, 
  HelpCircle, 
  Building, 
  CheckSquare, 
  Shield, 
  MapPin, 
  Archive,
  Phone,
  User
} from "lucide-react";

export default function Sitemap() {
  const navigationSections = [
    {
      title: "Main Navigation",
      description: "Core platform features and tools",
      links: [
        { href: "/", label: "Dashboard", icon: Home, description: "Main dashboard with personalized insights" },
        { href: "/driver-checklist", label: "Authority Setup Checklist", icon: CheckSquare, description: "Complete your authority setup process" },
        { href: "/glovebox", label: "Glovebox Document Storage", icon: Archive, description: "Store and share important documents" },
        { href: "/driver-location", label: "Driver Location", icon: MapPin, description: "Update location and find nearby loads" },
        { href: "/opportunities", label: "Find Jobs", icon: Truck, description: "Browse available freight opportunities" },
        { href: "/documents", label: "Document Management", icon: FileText, description: "Manage all your documents and credentials" },
      ]
    },
    {
      title: "Registration & Onboarding",
      description: "Get started with ACHIEVEMOR",
      links: [
        { href: "/register/contractor", label: "Driver Registration", icon: Truck, description: "Register as an independent contractor" },
        { href: "/register/company", label: "Company Registration", icon: Building, description: "Register your company or fleet" },
      ]
    },
    {
      title: "Account Management",
      description: "Manage your profile and settings",
      links: [
        { href: "/profile", label: "Profile Settings", icon: User, description: "Update your personal information" },
        { href: "/settings", label: "Account Settings", icon: Settings, description: "Configure your account preferences" },
      ]
    },
    {
      title: "Support & Information",
      description: "Get help and learn more",
      links: [
        { href: "/about", label: "About ACHIEVEMOR", icon: HelpCircle, description: "Learn about our platform and mission" },
        { href: "/contact", label: "Contact Support", icon: Phone, description: "Get in touch with our support team" },
      ]
    },
    {
      title: "Administrative",
      description: "Administrative access and controls",
      links: [
        { href: "/admin-access", label: "Admin Access", icon: Shield, description: "Administrative portal access" },
        { href: "/admin/setup", label: "Admin Setup", icon: Settings, description: "Configure administrative settings" },
        { href: "/admin", label: "Admin Dashboard", icon: Shield, description: "Full administrative control panel" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <UniversalNav />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Site Navigation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Complete directory of all available features and pages in the ACHIEVEMOR platform
            </p>
          </div>

          {/* Navigation Sections */}
          <div className="space-y-8">
            {navigationSections.map((section) => (
              <Card key={section.title} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-white">
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.links.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link key={link.href} href={link.href}>
                          <Button
                            variant="ghost"
                            className="h-auto p-4 flex flex-col items-start text-left w-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {link.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {link.description}
                            </p>
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Navigation */}
          <Card className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Quick Navigation</h2>
              <p className="mb-6 text-blue-100">
                Access these navigation controls from anywhere in the platform
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                  <span className="font-semibold">Back Button:</span>
                  <span>Return to previous page</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                  <span className="font-semibold">Home Button:</span>
                  <span>Go to dashboard/landing page</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                  <span className="font-semibold">Mobile Menu:</span>
                  <span>Full navigation on mobile devices</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-12 text-gray-600 dark:text-gray-400">
            <p>
              Having trouble finding what you're looking for? 
              <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}