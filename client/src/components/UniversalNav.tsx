import { ArrowLeft, Home, User, LogIn, UserPlus, Settings, LogOut, Shield, Bell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export function UniversalNav() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const goHome = () => {
    navigate("/");
  };

  const goBack = () => {
    window.history.back();
  };

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "U";
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "User";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goHome}
              className="flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700"
            >
              <Home className="h-5 w-5" />
              <span className="hidden sm:inline">ACHIEVEMOR</span>
            </Button>

            {/* Navigation Menu - Desktop */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-1">
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/opportunities")}>
                  Opportunities
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/glovebox")}>
                  Glovebox
                </Button>
              </div>
            )}
          </div>

          {/* Right side - User Menu */}
          <div className="flex items-center space-x-2">
            {!isAuthenticated ? (
              // Not logged in - Show Sign In / Register
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={handleLogin}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/register")}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register
                </Button>
              </div>
            ) : (
              // Logged in - Show User Menu
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500">
                    3
                  </Badge>
                </Button>

                {/* User Dropdown - Desktop */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profileImageUrl} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{getUserDisplayName()}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/settings")}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/subscription")}>
                        <Shield className="mr-2 h-4 w-4" />
                        Subscription
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden">
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-72">
                      <SheetHeader>
                        <SheetTitle className="flex items-center space-x-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profileImageUrl} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{getUserDisplayName()}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </SheetTitle>
                      </SheetHeader>
                      
                      <div className="mt-6 space-y-1">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/dashboard")}>
                          <Home className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/opportunities")}>
                          <User className="mr-2 h-4 w-4" />
                          Opportunities
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/glovebox")}>
                          <Shield className="mr-2 h-4 w-4" />
                          Glovebox
                        </Button>
                        <div className="border-t my-4"></div>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/profile")}>
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/settings")}>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/subscription")}>
                          <Shield className="mr-2 h-4 w-4" />
                          Subscription
                        </Button>
                        <div className="border-t my-4"></div>
                        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back button for specific pages */}
      {location !== "/" && (
        <div className="absolute left-4 top-20">
          <Button
            variant="outline"
            size="sm"
            onClick={goBack}
            className="bg-white/95 backdrop-blur-md border shadow-lg hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      )}
    </nav>
  );
}