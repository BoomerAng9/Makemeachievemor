import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  MapPin, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface NavigationProps {
  onLogout?: () => void;
}

export function Navigation({ onLogout }: NavigationProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/location",
      label: "Location Services",
      icon: MapPin,
    },
    {
      href: "/glovebox",
      label: "Glovebox",
      icon: FileText,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    return location === href || (href === "/dashboard" && location === "/");
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive(item.href) ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
        {onLogout && (
          <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        )}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b shadow-lg z-50">
            <div className="flex flex-col space-y-2 p-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className="w-full justify-start gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              {onLogout && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}