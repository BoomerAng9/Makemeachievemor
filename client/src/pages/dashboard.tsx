import { useState } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useContractor, useContractorStats, useAvailableOpportunities, useContractorMessages, useContractorJobs } from "@/hooks/useContractor";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { JobOpportunities } from "@/components/dashboard/JobOpportunities";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ConsultationButton } from "@/components/business/ConsultationButton";
import { BackgroundCheckDashboard } from "@/components/background-check/BackgroundCheckDashboard";
import { PersonalizedWidgets } from "@/components/dashboard/PersonalizedWidgets";
import { Chatbot } from "@/components/ui/chatbot";
import { Truck, Phone, Mail, MapPin, TrendingUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { contractorId } = useParams();
  const { user } = useAuth();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Use the authenticated user as the contractor profile
  const contractor = user;
  const contractorLoading = false;
  const userId = user?.id;
  const { data: stats, isLoading: statsLoading } = useContractorStats(parseInt(userId));
  const { data: opportunities, isLoading: opportunitiesLoading } = useAvailableOpportunities();
  const { data: messages, isLoading: messagesLoading } = useContractorMessages(parseInt(userId));
  const { data: jobs, isLoading: jobsLoading } = useContractorJobs(parseInt(userId));

  if (contractorLoading) {
    return <DashboardSkeleton />;
  }

  if (!contractor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contractor Not Found</h1>
          <p className="text-gray-500">The requested contractor profile could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Truck className="text-white h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ACHIEVEMOR</h1>
                <p className="text-xs text-gray-500">Contractor Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="tel:912-742-9459" 
                className="text-accent hover:text-gray-900 transition-colors flex items-center"
              >
                <Phone className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">912-742-9459</span>
              </a>
              <Button variant="outline">Sign Out</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header - Following outlined structure */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome, {contractor?.name || contractor?.firstName + ' ' + contractor?.lastName || 'Driver'}
                  </h2>
                  <div className="flex items-center space-x-4">
                    <Badge 
                      variant={contractor?.status === 'active' ? 'default' : 'secondary'}
                      className={
                        contractor?.status === 'active' ? 'bg-green-100 text-green-800' : 
                        contractor?.status === 'pending_verification' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {contractor?.status === 'active' ? '✓ Active' : 
                       contractor?.status === 'pending_verification' ? 'Pending Verification' : 
                       'Suspended'}
                    </Badge>
                    <Badge variant="outline">
                      {contractor?.role?.charAt(0).toUpperCase() + contractor?.role?.slice(1) || 'Driver'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Member since {new Date(contractor?.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {stats?.completedJobs || 0}
                    </div>
                    <div className="text-xs text-gray-500">Jobs Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {stats?.rating || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <StatsGrid 
          stats={stats} 
          isLoading={statsLoading}
          availableJobsCount={opportunities?.length || 0}
          activeJobsCount={jobs?.filter(job => job.status === 'in_progress').length || 0}
        />

        {/* Job Opportunities with State Machine Flow */}
        <div className="mb-8">
          <JobOpportunities
            opportunities={opportunities || []}
            activeJobs={jobs || []}
            isLoading={opportunitiesLoading || jobsLoading}
            userId={userId}
          />
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Recent Activity and Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivity 
                jobs={jobs || []} 
                messages={messages || []}
                isLoading={jobsLoading || messagesLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Bar */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 hover:bg-blue-50"
                >
                  <Truck className="h-4 w-4" />
                  Find Routes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 hover:bg-green-50"
                >
                  <TrendingUp className="h-4 w-4" />
                  Track Earnings
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 hover:bg-orange-50"
                  onClick={() => window.location.href = '/driver-checklist'}
                >
                  <FileText className="h-4 w-4" />
                  Authority Checklist
                </Button>
                <ConsultationButton type="contractor" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI-Powered Personalized Widgets */}
        {userId && (
          <div className="space-y-4 sm:space-y-6">
            <PersonalizedWidgets contractorId={parseInt(userId)} />
          </div>
        )}

        {/* Glovebox Document Storage */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Glovebox - Document Storage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-20 flex-col">
                <a href="/glovebox">
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">View Documents</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col">
                <a href="/glovebox">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span className="text-sm">Upload New</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col">
                <a href="/glovebox">
                  <Truck className="h-6 w-6 mb-2" />
                  <span className="text-sm">Share Documents</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Background Check Section */}
        {userId && (
          <div className="space-y-4 sm:space-y-6">
            <BackgroundCheckDashboard contractorId={parseInt(userId)} />
          </div>
        )}

        {/* Contact Information Footer */}
        <Card className="bg-gray-900 text-white">
          <CardContent className="p-6">
            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4">Need Support?</h4>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
                  <a 
                    href="tel:912-742-9459" 
                    className="flex items-center hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    912-742-9459
                  </a>
                  <a 
                    href="mailto:delivered@byachievemor.com" 
                    className="flex items-center hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    delivered@byachievemor.com
                  </a>
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Pooler, GA 31322
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <ConsultationButton 
                    type="contractor" 
                    variant="outline" 
                    size="sm"
                  />
                  <div className="text-sm text-gray-300">
                    Est. 2019 • byachievemor.com
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Chatbot */}
      <Chatbot 
        isOpen={isChatbotOpen} 
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)} 
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 h-16" />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    </div>
  );
}
