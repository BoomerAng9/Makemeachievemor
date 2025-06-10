import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  FileText,
  Truck,
  Users,
  HelpCircle,
  Building,
  CheckSquare,
  Shield,
  Phone,
  BarChart3,
  MapPin,
  Settings,
  BookOpen
} from "lucide-react";

interface SitemapSection {
  title: string;
  description: string;
  links: {
    href: string;
    label: string;
    icon: any;
    description: string;
    isNew?: boolean;
    authRequired?: boolean;
  }[];
}

export function Sitemap() {
  const sitemapSections: SitemapSection[] = [
    {
      title: "Main Navigation",
      description: "Core platform features and pages",
      links: [
        {
          href: "/",
          label: "Dashboard",
          icon: Home,
          description: "Contractor dashboard with personalized insights and AI recommendations",
          authRequired: true
        },
        {
          href: "/driver-checklist",
          label: "Authority Setup Checklist",
          icon: CheckSquare,
          description: "Interactive checklist for trucking authority compliance and setup",
          isNew: true,
          authRequired: true
        },
        {
          href: "/about",
          label: "About ACHIEVEMOR",
          icon: HelpCircle,
          description: "Learn about our mission and services for independent contractors"
        }
      ]
    },
    {
      title: "Contractor Services",
      description: "Tools and services for independent drivers",
      links: [
        {
          href: "/opportunities",
          label: "Job Opportunities",
          icon: Truck,
          description: "Browse and apply for available freight opportunities",
          authRequired: true
        },
        {
          href: "/documents",
          label: "Document Management",
          icon: FileText,
          description: "Upload and manage compliance documents",
          authRequired: true
        },
        {
          href: "/tracking",
          label: "GPS Tracking",
          icon: MapPin,
          description: "Real-time location tracking for active jobs",
          authRequired: true
        },
        {
          href: "/reports",
          label: "Performance Reports",
          icon: BarChart3,
          description: "View earnings, performance metrics, and analytics",
          authRequired: true
        }
      ]
    },
    {
      title: "Compliance & Safety",
      description: "Background checks, certifications, and safety tools",
      links: [
        {
          href: "/background-check",
          label: "Background Check",
          icon: Shield,
          description: "Submit and track background verification requests",
          authRequired: true
        },
        {
          href: "/safety-quiz",
          label: "Safety Quiz",
          icon: BookOpen,
          description: "Interactive safety training with gamification elements",
          authRequired: true
        },
        {
          href: "/compliance",
          label: "Compliance Dashboard",
          icon: Shield,
          description: "Monitor compliance status and upcoming renewals",
          authRequired: true
        }
      ]
    },
    {
      title: "Business Services",
      description: "Professional consultation and company services",
      links: [
        {
          href: "/business-services",
          label: "Business Consultation",
          icon: Phone,
          description: "Expert consultation for contractors and companies"
        },
        {
          href: "/register/contractor",
          label: "Contractor Registration",
          icon: Truck,
          description: "Join as an independent contractor driver"
        },
        {
          href: "/register/company",
          label: "Company Registration",
          icon: Building,
          description: "Partner with us as a logistics company"
        }
      ]
    },
    {
      title: "Account & Settings",
      description: "User account management and preferences",
      links: [
        {
          href: "/profile",
          label: "Profile Management",
          icon: Users,
          description: "Update personal information and preferences",
          authRequired: true
        },
        {
          href: "/settings",
          label: "Account Settings",
          icon: Settings,
          description: "Configure notifications and privacy settings",
          authRequired: true
        },
        {
          href: "/onboarding",
          label: "Onboarding Process",
          icon: BookOpen,
          description: "Complete contractor setup and verification",
          authRequired: true
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Site Map</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Navigate through all available features and services on the ACHIEVEMOR platform. 
            Find tools for compliance, job management, business consultation, and more.
          </p>
        </div>

        {/* Sitemap Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sitemapSections.map((section, index) => (
            <Card key={index} className="h-fit">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">{section.title}</CardTitle>
                <p className="text-sm text-gray-600">{section.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.links.map((link, linkIndex) => {
                    const Icon = link.icon;
                    return (
                      <Link key={linkIndex} href={link.href}>
                        <div className="group p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                              <Icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-gray-900 group-hover:text-blue-900">
                                  {link.label}
                                </h3>
                                {link.isNew && (
                                  <Badge variant="secondary" className="text-xs">New</Badge>
                                )}
                                {link.authRequired && (
                                  <Badge variant="outline" className="text-xs">Login Required</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 group-hover:text-blue-700">
                                {link.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join thousands of independent contractors who trust ACHIEVEMOR for their 
                compliance, business growth, and operational needs.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/register/contractor">
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Register as Contractor
                  </button>
                </Link>
                <Link href="/driver-checklist">
                  <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                    Start Authority Checklist
                  </button>
                </Link>
                <Link href="/business-services">
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Get Consultation
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Need help finding what you're looking for? 
            <Link href="/business-services" className="text-blue-600 hover:underline ml-1">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}