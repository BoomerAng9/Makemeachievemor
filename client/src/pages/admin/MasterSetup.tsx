import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Lock, User } from "lucide-react";

export default function MasterSetup() {
  const [masterKey, setMasterKey] = useState("");
  const [setupComplete, setSetupComplete] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const setupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/admin/setup-master", {
        method: "POST",
        body: JSON.stringify({
          masterKey,
          userId: user?.id,
        }),
      });
    },
    onSuccess: () => {
      setSetupComplete(true);
      toast({
        title: "Master Admin Setup Complete",
        description: "You now have full administrative access to the platform.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSetup = () => {
    if (!masterKey) {
      toast({
        title: "Master Key Required",
        description: "Please enter the master setup key.",
        variant: "destructive",
      });
      return;
    }
    setupMutation.mutate();
  };

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Setup Complete</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your admin account has been successfully configured. You can now access the admin panel.
            </p>
            <Button 
              onClick={() => window.location.href = "/admin"}
              className="w-full"
            >
              Go to Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Master Admin Setup</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Configure the first administrator account for ACHIEVEMOR
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              Setting up admin access for: <strong>{user?.email}</strong>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="masterKey">Master Setup Key</Label>
              <Input
                id="masterKey"
                type="password"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="Enter master setup key"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Contact ACHIEVEMOR support for the master setup key
              </p>
            </div>

            <Button 
              onClick={handleSetup}
              disabled={setupMutation.isPending || !masterKey}
              className="w-full"
            >
              {setupMutation.isPending ? "Setting up..." : "Setup Master Admin"}
            </Button>
          </div>

          <div className="text-sm text-gray-500 space-y-2">
            <p><strong>Master Admin Capabilities:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>View and manage all user accounts</li>
              <li>Suspend or activate user accounts</li>
              <li>Grant admin access to team members</li>
              <li>Monitor platform activity</li>
              <li>Configure platform settings</li>
              <li>Override user permissions when needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}