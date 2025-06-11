import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Phone, MessageSquare, ArrowLeft, Home } from "lucide-react";

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  name: z.string().min(2, "Name is required"),
  role: z.string().min(1, "Role is required"),
});

const verificationSchema = z.object({
  code: z.string().min(6, "Verification code must be 6 digits").max(6, "Verification code must be 6 digits"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type VerificationFormData = z.infer<typeof verificationSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"phone" | "verification">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: "",
      name: "",
      role: "driver",
    },
  });

  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  const handleSendCode = async (data: PhoneFormData) => {
    setIsLoading(true);
    try {
      const cleanedPhone = data.phoneNumber.replace(/\D/g, '');
      const response = await apiRequest("/api/auth/send-code", "POST", {
        phoneNumber: cleanedPhone,
      });

      setPhoneNumber(cleanedPhone);
      setStep("verification");
      
      // Store user data for verification step
      localStorage.setItem("pendingUserData", JSON.stringify({
        name: data.name,
        role: data.role,
      }));

      toast({
        title: "Code Sent",
        description: "Check your phone for the verification code",
      });

      // Start countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (data: VerificationFormData) => {
    setIsLoading(true);
    try {
      const pendingData = localStorage.getItem("pendingUserData");
      const userData = pendingData ? JSON.parse(pendingData) : { name: "User", role: "driver" };

      const response = await apiRequest("/api/auth/verify", "POST", {
        phoneNumber,
        code: data.code,
        name: userData.name,
        role: userData.role,
      });

      localStorage.removeItem("pendingUserData");
      
      toast({
        title: "Login Successful",
        description: "Welcome to ACHIEVEMOR!",
      });

      // Redirect based on role
      if (userData.role === "company") {
        setLocation("/company-dashboard");
      } else if (userData.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      await apiRequest("/api/auth/send-code", "POST", {
        phoneNumber,
      });

      toast({
        title: "Code Resent",
        description: "A new verification code has been sent",
      });

      // Restart countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step === "verification" ? setStep("phone") : setLocation("/")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              {step === "phone" ? (
                <Phone className="text-white h-6 w-6" />
              ) : (
                <MessageSquare className="text-white h-6 w-6" />
              )}
            </div>
            <CardTitle>
              {step === "phone" ? "Sign In with SMS" : "Enter Verification Code"}
            </CardTitle>
            <CardDescription>
              {step === "phone" 
                ? "Enter your phone number to receive a verification code"
                : `We sent a 6-digit code to ${formatPhoneNumber(phoneNumber)}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "phone" ? (
              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit(handleSendCode)} className="space-y-4">
                  <FormField
                    control={phoneForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={phoneForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="driver">Independent Contractor</SelectItem>
                            <SelectItem value="company">Company Partner</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={phoneForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(555) 123-4567"
                            {...field}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Verification Code"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...verificationForm}>
                <form onSubmit={verificationForm.handleSubmit(handleVerifyCode)} className="space-y-4">
                  <FormField
                    control={verificationForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123456"
                            maxLength={6}
                            className="text-center text-lg tracking-widest"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Verify & Sign In"}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendCode}
                      disabled={countdown > 0 || isLoading}
                      className="text-sm"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need help? Call{" "}
                <a 
                  href="tel:912-742-9459" 
                  className="text-primary hover:underline"
                >
                  (912) 742-9459
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}