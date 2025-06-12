import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import ProfilePage from "@/pages/profile";
import AboutPage from "@/pages/about";
import OnboardingPage from "@/pages/onboarding";
import DashboardPage from "@/pages/dashboard";
import DriverChecklistPage from "@/pages/driver-checklist";
import GloveboxPage from "@/pages/glovebox";
import DriverLocationPage from "@/pages/driver-location";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import MasterSetup from "@/pages/admin/MasterSetup";
import AdminAccess from "@/pages/AdminAccess";
import SitemapPage from "@/pages/sitemap";
import RegisterPage from "@/pages/register";
import RegisterContractorPage from "@/pages/register-contractor";
import RegisterCompanyPage from "@/pages/register-company";
import OpportunitiesPage from "@/pages/opportunities";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes - always accessible */}
      <Route path="/home" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/sitemap" component={SitemapPage} />
      <Route path="/driver-checklist" component={DriverChecklistPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/register/contractor" component={RegisterContractorPage} />
      <Route path="/register/company" component={RegisterCompanyPage} />
      <Route path="/opportunities" component={OpportunitiesPage} />
      <Route path="/admin/setup" component={MasterSetup} />
      <Route path="/admin-access" component={AdminAccess} />
      <Route path="/onboarding" component={OnboardingPage} />
      
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={HomePage} />
        </>
      ) : (
        <>
          <Route path="/" component={HomePage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/dashboard/:contractorId" component={DashboardPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/glovebox" component={GloveboxPage} />
          <Route path="/driver-location" component={DriverLocationPage} />
          <Route path="/admin" component={AdminDashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
