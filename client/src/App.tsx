import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useDeviceType } from "@/hooks/use-mobile";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
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
import RegisterContractorPage from "@/pages/register-contractor";
import RegisterCompanyPage from "@/pages/register-company";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={LandingPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/sitemap" component={SitemapPage} />
          <Route path="/driver-checklist" component={DriverChecklistPage} />
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
          <Route path="/glovebox" component={GloveboxPage} />
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
  const { isMobile } = useDeviceType();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
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
