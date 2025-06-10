import { useState } from "react";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { Truck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Truck className="text-white h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ACHIEVEMOR</h1>
                <p className="text-xs text-gray-500">Contractor Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="tel:912-742-9459" 
                className="text-accent hover:text-gray-900 transition-colors flex items-center"
              >
                <Phone className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">912-742-9459</span>
              </a>
              <Button className="bg-primary hover:bg-primary/90">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <OnboardingWizard />
      </main>
    </div>
  );
}
