import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import OpportunitiesPage from "@/pages/opportunities";
import OnboardingPage from "@/pages/onboarding";
import DashboardPage from "@/pages/dashboard";
import DriverChecklistPage from "@/pages/driver-checklist";
import GloveboxPage from "@/pages/glovebox";
import DriverLocationPage from "@/pages/driver-location";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import MasterSetup from "@/pages/admin/MasterSetup";
import AdminAccess from "@/pages/AdminAccess";
import SitemapPage from "@/pages/sitemap";
import RegisterContractorPage from "@/pages/register-contractor";
import RegisterCompanyPage from "@/pages/register-company";
import SettingsPage from "@/pages/settings";
import SubscriptionPage from "@/pages/subscription";
import ProfilePage from "@/pages/profile";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={HomePage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/sitemap" component={SitemapPage} />
          <Route path="/driver-checklist" component={DriverChecklistPage} />
          <Route path="/register" component={RegisterContractorPage} />
          <Route path="/register/contractor" component={RegisterContractorPage} />
          <Route path="/register/company" component={RegisterCompanyPage} />
          <Route path="/admin/setup" component={MasterSetup} />
          <Route path="/admin-access" component={AdminAccess} />
          <Route path="/onboarding" component={OnboardingPage} />
        </>
      ) : (
        <>
          <Route path="/" component={DashboardPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/sitemap" component={SitemapPage} />
          <Route path="/dashboard/:contractorId" component={DashboardPage} />
          <Route path="/driver-checklist" component={DriverChecklistPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/opportunities" component={OpportunitiesPage} />
          <Route path="/glovebox" component={GloveboxPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/subscription" component={SubscriptionPage} />
          <Route path="/driver-location" component={DriverLocationPage} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/setup" component={MasterSetup} />
          <Route path="/onboarding" component={OnboardingPage} />
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
