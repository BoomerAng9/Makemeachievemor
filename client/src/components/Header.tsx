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
  Shield,
  Phone,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + '/');
  };

  const authMenuItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/driver-checklist", label: "Authority Checklist", icon: CheckSquare, isNew: true },
    { href: "/opportunities", label: "Find Jobs", icon: Truck },
    { href: "/documents", label: "Documents", icon: FileText },
  ];

  const publicMenuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: HelpCircle },
    { href: "/register/contractor", label: "For Drivers", icon: Truck },
    { href: "/register/company", label: "For Companies", icon: Building },
  ];

  const menuItems = isAuthenticated ? authMenuItems : publicMenuItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ACHIEVEMOR</span>
          </div>
        </Link>

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
                  {item.isNew && (
                    <Badge variant="secondary" className="text-xs">New</Badge>
                  )}
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

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/api/login">
                <Button size="sm">Sign In</Button>
              </Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:inline">
                    {user?.firstName || 'User'}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  {user?.firstName} {user?.lastName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 w-full">
                    <Users className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2 w-full">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="flex items-center gap-2 w-full">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu */}
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
                          {item.isNew && (
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
                        <h3 className="text-sm font-medium text-muted-foreground px-3">Quick Tools</h3>
                      </div>
                      
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

                  {/* Mobile Auth Section */}
                  {!isAuthenticated && (
                    <div className="pt-4 border-t">
                      <Link href="/api/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}