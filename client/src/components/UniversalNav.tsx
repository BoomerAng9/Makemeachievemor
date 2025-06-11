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
    <div className="fixed top-4 left-4 z-50 flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={goBack}
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border shadow-sm hover:bg-gray-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={goHome}
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border shadow-sm hover:bg-gray-50"
      >
        <Home className="h-4 w-4" />
        Home
      </Button>
    </div>
  );
}