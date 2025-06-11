import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, MessageSquare } from "lucide-react";

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format"),
});

const codeSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits").regex(/^\d+$/, "Code must contain only numbers"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type CodeFormData = z.infer<typeof codeSchema>;

export default function Login() {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      code: "",
    },
  });

  const requestCodeMutation = useMutation({
    mutationFn: async (data: PhoneFormData) => {
      return apiRequest("/api/auth/request-code", "POST", data);
    },
    onSuccess: () => {
      setPhoneNumber(phoneForm.getValues("phoneNumber"));
      setStep("code");
      toast({
        title: "Code Sent",
        description: "Please check your phone for the verification code.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async (data: CodeFormData) => {
      return apiRequest("/api/auth/verify-code", "POST", {
        phoneNumber,
        code: data.code,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully logged in!",
      });
      // Redirect to dashboard
      window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    },
  });

  const onPhoneSubmit = (data: PhoneFormData) => {
    requestCodeMutation.mutate(data);
  };

  const onCodeSubmit = (data: CodeFormData) => {
    verifyCodeMutation.mutate(data);
  };

  const goBack = () => {
    setStep("phone");
    codeForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            ACHIEVEMOR
          </CardTitle>
          <CardDescription>
            {step === "phone" 
              ? "Enter your phone number to get started" 
              : "Enter the verification code sent to your phone"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                <FormField
                  control={phoneForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="+1 (555) 123-4567"
                            className="pl-10"
                            type="tel"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={requestCodeMutation.isPending}
                >
                  {requestCodeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...codeForm}>
              <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4">
                <FormField
                  control={codeForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="123456"
                          className="text-center text-lg tracking-widest"
                          maxLength={6}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-sm text-muted-foreground text-center">
                  Code sent to {phoneNumber}
                </div>
                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={verifyCodeMutation.isPending}
                  >
                    {verifyCodeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={goBack}
                    disabled={verifyCodeMutation.isPending}
                  >
                    Back to Phone Number
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}