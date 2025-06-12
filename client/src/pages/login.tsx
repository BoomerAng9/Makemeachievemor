import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UniversalNav } from "@/components/UniversalNav";
import { 
  Truck, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  Shield
} from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Use Replit Auth login
      window.location.href = "/api/login";
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    // For now, redirect to contact form
    setLocation("/#contact");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <UniversalNav />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 p-3 bg-blue-600 rounded-full w-fit">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to your ACHIEVEMOR account
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-center">Sign In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Replit Auth Login */}
              <div className="space-y-4">
                <Button
                  onClick={() => window.location.href = "/api/login"}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  <Shield className="h-5 w-5 mr-2" />
                  {isLoading ? "Signing in..." : "Sign in with ACHIEVEMOR"}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Secure authentication powered by Replit
                  </p>
                </div>
              </div>

              <Separator />

              {/* Alternative Login Methods */}
              <div className="space-y-4">
                <p className="text-sm text-center text-muted-foreground">
                  Choose your login method:
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = "/api/login"}
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Continue with Email
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Help Links */}
              <div className="space-y-3 text-center">
                <button
                  onClick={handleResetPassword}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot your password?
                </button>
                
                <div className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-blue-600 hover:underline font-medium">
                    Create one here
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-0">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 text-center">Why Choose ACHIEVEMOR?</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  <span>Secure document management with Glovebox</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                  <span>AI-powered business insights and recommendations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
                  <span>Professional networking and job opportunities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-red-600 rounded-full"></div>
                  <span>Automated background checks and compliance</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Need help signing in?
            </p>
            <Link href="/#contact">
              <Button variant="ghost" size="sm">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}