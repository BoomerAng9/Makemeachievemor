import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useDeviceType } from "@/hooks/use-mobile";
import { NetworkStatusBanner } from "@/components/NetworkStatusIndicator";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import OnboardingPage from "@/pages/onboarding";
import DashboardPage from "@/pages/dashboard-page";
import TestDashboard from "@/pages/test-dashboard";
import ContractorProfilePage from "@/pages/contractor-profile";
import UserSettingsPage from "@/pages/user-settings";
import DriverChecklistPage from "@/pages/driver-checklist";
import GloveboxPage from "@/pages/glovebox";
import DriverLocationPage from "@/pages/driver-location";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import MasterSetup from "@/pages/admin/MasterSetup";
import AdminAccess from "@/pages/AdminAccess";
import NewAdminDashboard from "@/components/admin/AdminDashboard";
import SitemapPage from "@/pages/sitemap";
import RegisterContractorPage from "@/pages/register-contractor-simple";
import RegisterCompanyPage from "@/pages/register-company";
import LoginPage from "@/pages/login-page";
import RegisterPage from "@/pages/register-page";
import AccountSettingsPage from "@/pages/account-settings";
import AuthorityChecklistPage from "@/pages/authority-checklist";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Loading ACHIEVEMOR</p>
            <p className="text-muted-foreground">Preparing your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Authentication pages - always available */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={TestDashboard} />
      
      {/* Public pages */}
      <Route path="/home" component={HomePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/sitemap" component={SitemapPage} />
      <Route path="/driver-checklist" component={DriverChecklistPage} />
      <Route path="/authority-checklist" component={DriverChecklistPage} />
      <Route path="/register/contractor" component={TestDashboard} />
      <Route path="/register/company" component={TestDashboard} />
      <Route path="/admin/setup" component={MasterSetup} />
      <Route path="/admin-access" component={AdminAccess} />
      <Route path="/onboarding" component={TestDashboard} />
      
      {/* Public routes - accessible to all users */}
      <Route path="/landing" component={LandingPage} />
      
      {/* Main application routes */}
      <Route path="/dashboard" component={TestDashboard} />
      <Route path="/dashboard/:contractorId" component={TestDashboard} />
      <Route path="/profile" component={ContractorProfilePage} />
      <Route path="/profile/:contractorId" component={ContractorProfilePage} />
      <Route path="/contractor-profile" component={ContractorProfilePage} />
      <Route path="/glovebox" component={GloveboxPage} />
      <Route path="/load-board" component={TestDashboard} />
      <Route path="/choose-two" component={TestDashboard} />
      <Route path="/job-matching" component={TestDashboard} />
      <Route path="/driver-location" component={DriverLocationPage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/panel" component={NewAdminDashboard} />
      <Route path="/admin" component={AdminAccess} />
      <Route path="/settings" component={UserSettingsPage} />
      
      {/* Root route */}
      <Route path="/" component={LandingPage} />
      
      {/* Fallback route */}
      <Route component={LandingPage} />
    </Switch>
  );
}

function App() {
  const { isMobile } = useDeviceType();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          {/* Network Status Banner */}
          <NetworkStatusBanner />
          
          {/* Main App Content */}
          <div className={isMobile ? "pb-20" : ""}>
            <Router />
          </div>
          
          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
          
          {/* Toast Notifications */}
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
