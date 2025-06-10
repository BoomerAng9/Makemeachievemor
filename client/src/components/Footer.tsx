import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  CheckSquare,
  FileText,
  Shield,
  Phone,
  Mail,
  MapPin,
  Home,
  HelpCircle,
  Building
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const contractorLinks = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/driver-checklist", label: "Authority Checklist", icon: CheckSquare, isNew: true },
    { href: "/opportunities", label: "Find Jobs", icon: Truck },
    { href: "/documents", label: "Documents", icon: FileText },
    { href: "/background-check", label: "Background Check", icon: Shield },
  ];

  const companyLinks = [
    { href: "/register/company", label: "Company Registration", icon: Building },
    { href: "/business-services", label: "Business Consultation", icon: Phone },
    { href: "/about", label: "About Us", icon: HelpCircle },
    { href: "/sitemap", label: "Site Map", icon: MapPin },
  ];

  const supportLinks = [
    { href: "/business-services", label: "Get Support", icon: Phone },
    { href: "/about", label: "About ACHIEVEMOR", icon: HelpCircle },
    { href: "/sitemap", label: "Site Map", icon: MapPin },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-gray-900" />
              </div>
              <span className="text-xl font-bold">ACHIEVEMOR</span>
            </div>
            <p className="text-gray-300 text-sm">
              Empowering independent contractors with comprehensive onboarding, 
              compliance tools, and growth opportunities in the logistics industry.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">support@achievemor.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">1-800-ACHIEVE</span>
              </div>
            </div>
          </div>

          {/* Contractor Tools */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contractor Tools</h3>
            <ul className="space-y-2">
              {contractorLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
                        <Icon className="h-4 w-4 group-hover:text-blue-400" />
                        <span className="text-sm">{link.label}</span>
                        {link.isNew && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Business Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Business Services</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
                        <Icon className="h-4 w-4 group-hover:text-blue-400" />
                        <span className="text-sm">{link.label}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Support & Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Support & Resources</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
                        <Icon className="h-4 w-4 group-hover:text-blue-400" />
                        <span className="text-sm">{link.label}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            
            {/* Quick Access to New Features */}
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h4 className="font-medium text-white mb-2">New Feature</h4>
              <Link href="/driver-checklist">
                <div className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                  <CheckSquare className="h-4 w-4" />
                  <span className="text-sm">Authority Setup Checklist</span>
                  <Badge variant="secondary" className="text-xs">New</Badge>
                </div>
              </Link>
              <p className="text-xs text-gray-400 mt-1">
                Interactive compliance tracking for trucking authority setup
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-gray-400">
              © {currentYear} ACHIEVEMOR. All rights reserved. Founded in 2019.
            </div>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-sm text-gray-400 hover:text-white transition-colors">
                Site Map
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}