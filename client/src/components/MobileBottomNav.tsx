import { Home, FileText, MapPin, User, Briefcase } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useDeviceType } from "@/hooks/use-mobile";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  icon: typeof Home;
  label: string;
  requiresAuth?: boolean;
}

const navigationItems: NavItem[] = [
  {
    path: "/",
    icon: Home,
    label: "Home",
  },
  {
    path: "/glovebox",
    icon: FileText,
    label: "Glovebox",
    requiresAuth: true,
  },
  {
    path: "/driver-location",
    icon: MapPin,
    label: "Location",
    requiresAuth: true,
  },
  {
    path: "/driver-checklist",
    icon: Briefcase,
    label: "Checklist",
  },
];

export function MobileBottomNav() {
  const [location, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { isMobile } = useDeviceType();

  if (!isMobile) {
    return null;
  }

  const visibleItems = navigationItems.filter(item => 
    !item.requiresAuth || isAuthenticated
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center p-3 min-w-[60px] rounded-lg transition-all duration-200 touch-manipulation",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive && "text-primary")} />
              <span className={cn(
                "text-xs font-medium",
                isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}