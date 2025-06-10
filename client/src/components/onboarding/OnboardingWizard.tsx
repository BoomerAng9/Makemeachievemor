import { useState } from "react";
import { PersonalInfoStep } from "./PersonalInfoStep";
import { IdentityVerificationStep } from "./IdentityVerificationStep";
import { VehicleInfoStep } from "./VehicleInfoStep";
import { ComplianceStep } from "./ComplianceStep";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { InsertContractor } from "@shared/schema";
import { useLocation } from "wouter";

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [contractorData, setContractorData] = useState<Partial<InsertContractor>>({});
  const [, setLocation] = useLocation();
  
  const totalSteps = 5;
  const steps = [
    "Personal Info",
    "Identity",
    "Vehicle",
    "Compliance",
    "Complete"
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return contractorData.firstName && contractorData.lastName && contractorData.email && contractorData.phone;
      case 2:
        return true; // Identity verification can be completed later
      case 3:
        return true; // Vehicle info can be completed later
      case 4:
        return contractorData.dotNumber; // DOT number is required
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (stepData: any) => {
    setContractorData(prev => ({ ...prev, ...stepData }));
    
    if (currentStep === 4) {
      // Complete onboarding and redirect to dashboard
      // In a real app, you'd create the contractor here
      setLocation('/dashboard/1'); // Mock contractor ID
    } else {
      nextStep();
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Contractor Onboarding</h2>
          <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
        </div>
        <Progress value={progressPercentage} className="mb-4" />
        <div className="flex justify-between text-xs text-gray-500">
          {steps.map((step, index) => (
            <span 
              key={step}
              className={index + 1 <= currentStep ? 'text-primary font-medium' : ''}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {currentStep === 1 && (
          <PersonalInfoStep 
            data={contractorData}
            onComplete={handleStepComplete}
          />
        )}
        {currentStep === 2 && (
          <IdentityVerificationStep 
            contractorId={1} // Mock ID for now
            onComplete={handleStepComplete}
          />
        )}
        {currentStep === 3 && (
          <VehicleInfoStep 
            contractorId={1} // Mock ID for now
            onComplete={handleStepComplete}
          />
        )}
        {currentStep === 4 && (
          <ComplianceStep 
            data={contractorData}
            onComplete={handleStepComplete}
          />
        )}
        {currentStep === 5 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChevronRight className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Onboarding Complete!</h3>
            <p className="text-gray-600 mb-6">
              Your profile has been submitted for review. You'll receive an email once verification is complete.
            </p>
            <Button onClick={() => setLocation('/dashboard/1')}>
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 5 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex items-center bg-primary hover:bg-primary/90"
          >
            Next Step
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
