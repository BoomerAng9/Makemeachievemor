import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function UniversalNav() {
  const [location, navigate] = useLocation();

  const goHome = () => {
    navigate("/");
  };

  const goBack = () => {
    window.history.back();
  };

  // Don't show navigation on the home page
  if (location === "/") {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 flex gap-2 sm:gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={goBack}
        className="flex items-center gap-1 sm:gap-2 bg-white/95 backdrop-blur-md border shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium"
      >
        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Back</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={goHome}
        className="flex items-center gap-1 sm:gap-2 bg-white/95 backdrop-blur-md border shadow-lg hover:bg-primary/10 hover:shadow-xl hover:border-primary/20 transition-all duration-200 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium"
      >
        <Home className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Home</span>
      </Button>
    </div>
  );
}