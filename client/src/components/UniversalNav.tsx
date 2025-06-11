import { Button } from "@/components/ui/button";
import { Truck, ArrowLeft, Home } from "lucide-react";

interface UniversalNavProps {
  showBackButton?: boolean;
  backUrl?: string;
  title?: string;
}

export function UniversalNav({ 
  showBackButton = true, 
  backUrl = "/", 
  title = "ACHIEVEMOR" 
}: UniversalNavProps) {
  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="max-w-7xl mx-auto mb-8">
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
        {showBackButton ? (
          <Button 
            variant="outline" 
            onClick={() => handleNavigate(backUrl)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <div></div>
        )}
        
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        
        <Button 
          onClick={() => handleNavigate('/')}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Home
        </Button>
      </div>
    </div>
  );
}