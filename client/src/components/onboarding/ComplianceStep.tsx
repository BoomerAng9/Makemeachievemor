import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardCheck } from "lucide-react";
import type { InsertContractor } from "@shared/schema";

const complianceSchema = z.object({
  dotNumber: z.string().min(1, "DOT Number is required"),
  mcNumber: z.string().optional(),
  hasValidCDL: z.boolean(),
  hasDOTMedical: z.boolean(),
  hasVehicleRegistration: z.boolean(),
  hasLiabilityInsurance: z.boolean(),
});

type ComplianceData = z.infer<typeof complianceSchema>;

interface ComplianceStepProps {
  data: Partial<InsertContractor>;
  onComplete: (data: any) => void;
}

export function ComplianceStep({ data, onComplete }: ComplianceStepProps) {
  const form = useForm<ComplianceData>({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      dotNumber: data.dotNumber || "",
      mcNumber: data.mcNumber || "",
      hasValidCDL: false,
      hasDOTMedical: false,
      hasVehicleRegistration: false,
      hasLiabilityInsurance: false,
    },
  });

  const onSubmit = (formData: ComplianceData) => {
    const allRequirementsMet = 
      formData.hasValidCDL &&
      formData.hasDOTMedical &&
      formData.hasVehicleRegistration &&
      formData.hasLiabilityInsurance;

    onComplete({
      dotNumber: formData.dotNumber,
      mcNumber: formData.mcNumber,
      verificationStatus: allRequirementsMet ? 'verified' : 'pending',
      onboardingStep: 5,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <CardTitle>Compliance & Documentation</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="dotNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DOT Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="DOT-1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mcNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MC Number (if applicable)</FormLabel>
                    <FormControl>
                      <Input placeholder="MC-123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Compliance Checklist */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-700 mb-4">Compliance Requirements</h4>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasValidCDL"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Valid Commercial Driver's License (CDL)
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hasDOTMedical"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Current DOT Medical Certificate
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hasVehicleRegistration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Vehicle Registration & Title
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hasLiabilityInsurance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Proof of Liability Insurance
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit"
                className="bg-accent hover:bg-accent/90"
              >
                Complete Onboarding
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
