import { useState } from "react";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { Header } from "@/components/Header";

import { Truck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <OnboardingWizard />
      </main>
    </div>
  );
}
