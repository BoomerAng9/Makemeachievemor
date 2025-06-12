import { ArrowLeft, Home, User, LogIn, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  // Full navigation for home page
  if (location === "/") {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-blue-900">ACHIEVEMOR</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                Contact
              </Link>
              <Link href="/opportunities" className="text-gray-700 hover:text-blue-600 transition-colors">
                Opportunities
              </Link>
              
              {!isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Register
                    </Button>
                  </Link>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{user?.firstName || "Account"}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <Home className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Profile & Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t bg-white">
              <div className="flex flex-col space-y-3">
                <Link href="/#contact" className="text-gray-700 hover:text-blue-600 px-2 py-1">
                  Contact
                </Link>
                <Link href="/opportunities" className="text-gray-700 hover:text-blue-600 px-2 py-1">
                  Opportunities
                </Link>
                
                {!isAuthenticated ? (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Link href="/login">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        Register
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2 border-t">
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Home className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Profile & Settings
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="w-full justify-start text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // Compact navigation for other pages
  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center">
      {/* Left side - Back/Home buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goBack}
          className="flex items-center gap-1 sm:gap-2 bg-white/95 backdrop-blur-md border shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goHome}
          className="flex items-center gap-1 sm:gap-2 bg-white/95 backdrop-blur-md border shadow-lg hover:bg-primary/10 hover:shadow-xl hover:border-primary/20 transition-all duration-200 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium"
        >
          <Home className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Home</span>
        </Button>
      </div>

      {/* Right side - Auth buttons */}
      <div className="flex gap-2">
        {!isAuthenticated ? (
          <>
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/95 backdrop-blur-md border shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium"
              >
                <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1">Sign In</span>
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium"
              >
                Register
              </Button>
            </Link>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/95 backdrop-blur-md border shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1">{user?.firstName || "Account"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Profile & Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}