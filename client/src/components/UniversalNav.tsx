import { ArrowLeft, Home, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function UniversalNav() {
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const goHome = () => {
    navigate("/landing");
    setIsMenuOpen(false);
  };

  const goBack = () => {
    window.history.back();
    setIsMenuOpen(false);
  };

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Don't show navigation on the home pages
  if (location === "/" || location === "/landing") {
    return null;
  }

  // Mobile floating action button style navigation
  if (isMobile) {
    return (
      <>
        {/* Mobile FAB */}
        <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3">
          {isMenuOpen && (
            <div className="flex flex-col gap-2 mb-2">
              <Button
                variant="outline"
                size="lg"
                onClick={goBack}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-white/95 backdrop-blur-md border shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200 touch-manipulation"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={goHome}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-white/95 backdrop-blur-md border shadow-lg hover:bg-primary/10 hover:shadow-xl hover:border-primary/20 transition-all duration-200 touch-manipulation"
              >
                <Home className="h-6 w-6" />
              </Button>
            </div>
          )}
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 touch-manipulation",
              isMenuOpen 
                ? "bg-primary text-white rotate-180 scale-110" 
                : "bg-white/95 backdrop-blur-md border hover:bg-gray-50"
            )}
          >
            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </Button>
        </div>
        
        {/* Backdrop */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-200"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </>
    );
  }

  // Desktop/tablet navigation
  return (
    <div className="fixed top-6 left-6 z-40 flex gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={goBack}
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-200 px-3 py-2 text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden md:inline">Back</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={goHome}
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border shadow-md hover:bg-primary/10 hover:shadow-lg hover:border-primary/20 transition-all duration-200 px-3 py-2 text-sm font-medium"
      >
        <Home className="h-4 w-4" />
        <span className="hidden md:inline">Home</span>
      </Button>
    </div>
  );
}