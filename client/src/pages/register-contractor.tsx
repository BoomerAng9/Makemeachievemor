import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Clock } from "lucide-react";

export default function RegisterContractorPage() {
  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Contractor Registration
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Join the ACHIEVEMOR network as an independent contractor
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center p-8 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Coming Soon
              </h3>
              <p className="text-gray-600 mb-4">
                We're currently focusing on our Owner Operator Driver program. 
                Contractor registration will be available soon.
              </p>
              <p className="text-sm text-gray-500">
                Stay tuned for updates on our contractor opportunities.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleNavigate('/')}
                className="flex-1"
              >
                Back to Home
              </Button>
              <Button 
                onClick={() => handleNavigate('/register-company')}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Register Company
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}