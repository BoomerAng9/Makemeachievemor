import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Menu } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

interface NavigationHistory {
  path: string;
  title: string;
  timestamp: number;
}

export function UniversalNavigation() {
  const [location, setLocation] = useLocation();
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistory[]>([]);

  useEffect(() => {
    // Store navigation history in sessionStorage
    const currentPage = {
      path: location,
      title: getPageTitle(location),
      timestamp: Date.now()
    };

    const existingHistory = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
    const newHistory = [...existingHistory, currentPage].slice(-10); // Keep last 10 pages
    
    setNavigationHistory(newHistory);
    sessionStorage.setItem('navigationHistory', JSON.stringify(newHistory));
  }, [location]);

  const getPageTitle = (path: string): string => {
    const titles: Record<string, string> = {
      '/': 'Dashboard',
      '/dashboard': 'Dashboard',
      '/home': 'Home',
      '/settings': 'Settings',
      '/location': 'Location Services',
      '/glovebox': 'Glovebox',
      '/driver-location': 'Driver Location',
      '/opportunities': 'Opportunities',
      '/admin': 'Admin Dashboard'
    };
    return titles[path] || 'Page';
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const previousPage = navigationHistory[navigationHistory.length - 2];
      setLocation(previousPage.path);
    } else {
      setLocation('/');
    }
  };

  const goHome = () => {
    setLocation('/');
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-background border-b sticky top-0 z-50">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={goBack}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={goHome}
        className="flex items-center gap-2"
      >
        <Home className="h-4 w-4" />
        Home
      </Button>

      <div className="flex-1" />
      
      <div className="text-sm text-muted-foreground">
        {getPageTitle(location)}
      </div>
    </div>
  );
}

export function BreadcrumbNavigation() {
  const [location] = useLocation();
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistory[]>([]);

  useEffect(() => {
    const history = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
    setNavigationHistory(history);
  }, [location]);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-muted/50">
      {navigationHistory.slice(-3).map((page, index) => (
        <div key={page.timestamp} className="flex items-center gap-2">
          {index > 0 && <span>/</span>}
          <span 
            className={index === navigationHistory.slice(-3).length - 1 ? 'text-foreground font-medium' : 'hover:text-foreground cursor-pointer'}
            onClick={() => {
              if (index < navigationHistory.slice(-3).length - 1) {
                window.location.href = page.path;
              }
            }}
          >
            {page.title}
          </span>
        </div>
      ))}
    </div>
  );
}