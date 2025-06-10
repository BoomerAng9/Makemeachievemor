import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Settings } from "lucide-react";

export default function AdminAccess() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">ACHIEVEMOR Admin</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Administrative Control Panel
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Button 
              onClick={() => window.location.href = "/admin/setup"}
              className="w-full flex items-center justify-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Master Admin Setup
            </Button>
            
            <Button 
              onClick={() => window.location.href = "/admin"}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Users className="h-4 w-4" />
              Admin Dashboard
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 text-center mt-6">
            <p>Master Setup Key: <code className="bg-gray-100 px-2 py-1 rounded">ACHIEVEMOR_MASTER_SETUP_2024</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}