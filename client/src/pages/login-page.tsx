import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Lock, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { SiGoogle, SiGithub } from "react-icons/si";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved credentials from localStorage
  const loadSavedCredentials = () => {
    try {
      const savedUsername = localStorage.getItem('achievemor_saved_username');
      const savedPassword = localStorage.getItem('achievemor_saved_password');
      const rememberMe = localStorage.getItem('achievemor_remember_me') === 'true';
      
      return {
        username: savedUsername || "",
        password: savedPassword || "",
        rememberMe: rememberMe,
      };
    } catch {
      return { username: "", password: "", rememberMe: false };
    }
  };

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: loadSavedCredentials(),
  });

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = loadSavedCredentials();
    if (savedCredentials.username || savedCredentials.password) {
      form.reset(savedCredentials);
    }
  }, [form]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      await login(data.username, data.password);
      
      // Save credentials if Remember Me is checked
      if (data.rememberMe) {
        localStorage.setItem('achievemor_saved_username', data.username);
        localStorage.setItem('achievemor_saved_password', data.password);
        localStorage.setItem('achievemor_remember_me', 'true');
      } else {
        // Clear saved credentials if Remember Me is unchecked
        localStorage.removeItem('achievemor_saved_username');
        localStorage.removeItem('achievemor_saved_password');
        localStorage.removeItem('achievemor_remember_me');
      }
      
      setLocation("/"); // Redirect to home page
    } catch (error: any) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // SSO login handlers
  const handleSSOLogin = (provider: string) => {
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <CardDescription>
            Enter your credentials to access your ACHIEVEMOR account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Enter your username"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        Remember my username and password
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          {/* SSO Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleSSOLogin('google')}
                className="w-full"
              >
                <SiGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleSSOLogin('github')}
                className="w-full"
              >
                <SiGithub className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/register">
              <Button variant="link" className="p-0 h-auto font-semibold">
                Sign up
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}