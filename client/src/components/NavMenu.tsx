import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  Home,
  FileText,
  Truck,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  Building,
  CheckSquare,
  MapPin,
  BarChart3,
  Shield,
  Phone
} from "lucide-react";

interface NavMenuProps {
  isAuthenticated?: boolean;
  userRole?: 'contractor' | 'company' | 'admin';
}

export function NavMenu({ isAuthenticated = false, userRole = 'contractor' }: NavMenuProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + '/');
  };

  const contractorMenuItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/driver-checklist", label: "Authority Checklist", icon: CheckSquare },
    { href: "/opportunities", label: "Find Jobs", icon: Truck },
    { href: "/documents", label: "Documents", icon: FileText },
    { href: "/reports", label: "Reports", icon: BarChart3 },
  ];

  const companyMenuItems = [
    { href: "/company-dashboard", label: "Dashboard", icon: Home },
    { href: "/contractors", label: "Contractors", icon: Users },
    { href: "/jobs", label: "Job Management", icon: Truck },
    { href: "/compliance", label: "Compliance", icon: Shield },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const publicMenuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: HelpCircle },
    { href: "/register/contractor", label: "For Drivers", icon: Truck },
    { href: "/register/company", label: "For Companies", icon: Building },
  ];

  const getMenuItems = () => {
    if (!isAuthenticated) return publicMenuItems;
    if (userRole === 'company') return companyMenuItems;
    return contractorMenuItems;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive(item.href) ? "default" : "ghost"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}

        {/* Tools Dropdown for Authenticated Users */}
        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Tools
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Tools</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {userRole === 'contractor' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/driver-checklist" className="flex items-center gap-2 w-full">
                      <CheckSquare className="h-4 w-4" />
                      Authority Setup Checklist
                      <Badge variant="secondary" className="ml-auto text-xs">New</Badge>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/background-check" className="flex items-center gap-2 w-full">
                      <Shield className="h-4 w-4" />
                      Background Check
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/business-services" className="flex items-center gap-2 w-full">
                  <Phone className="h-4 w-4" />
                  Business Consultation
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="text-left">Navigation</SheetTitle>
              <SheetDescription className="text-left">
                Access all features and tools
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-12"
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                      {item.href === "/driver-checklist" && (
                        <Badge variant="secondary" className="ml-auto text-xs">New</Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}

              {/* Mobile Tools Section */}
              {isAuthenticated && (
                <>
                  <div className="pt-4 pb-2">
                    <h3 className="text-sm font-medium text-gray-500 px-3">Quick Tools</h3>
                  </div>
                  
                  {userRole === 'contractor' && (
                    <>
                      <Link href="/driver-checklist" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant={isActive("/driver-checklist") ? "default" : "ghost"}
                          className="w-full justify-start gap-3 h-12"
                        >
                          <CheckSquare className="h-5 w-5" />
                          Authority Setup Checklist
                          <Badge variant="secondary" className="ml-auto text-xs">New</Badge>
                        </Button>
                      </Link>
                      
                      <Link href="/background-check" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant={isActive("/background-check") ? "default" : "ghost"}
                          className="w-full justify-start gap-3 h-12"
                        >
                          <Shield className="h-5 w-5" />
                          Background Check
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  <Link href="/business-services" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive("/business-services") ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-12"
                    >
                      <Phone className="h-5 w-5" />
                      Business Consultation
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}