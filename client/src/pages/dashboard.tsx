import { useState } from "react";
import { useParams } from "wouter";
import { useContractor, useContractorStats, useAvailableOpportunities, useContractorMessages, useContractorJobs } from "@/hooks/useContractor";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ConsultationButton } from "@/components/business/ConsultationButton";
import { BackgroundCheckDashboard } from "@/components/background-check/BackgroundCheckDashboard";
import { Chatbot } from "@/components/ui/chatbot";
import { Truck, Phone, Mail, MapPin, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { contractorId } = useParams();
  const id = contractorId ? parseInt(contractorId) : undefined;
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const { data: contractor, isLoading: contractorLoading } = useContractor(id);
  const { data: stats, isLoading: statsLoading } = useContractorStats(id);
  const { data: opportunities, isLoading: opportunitiesLoading } = useAvailableOpportunities();
  const { data: messages, isLoading: messagesLoading } = useContractorMessages(id);
  const { data: jobs, isLoading: jobsLoading } = useContractorJobs(id);

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
        {/* Dashboard Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome, {contractor.firstName} {contractor.lastName}
                  </h2>
                  <div className="flex items-center space-x-4">
                    <Badge 
                      variant={contractor.verificationStatus === 'verified' ? 'default' : 'secondary'}
                      className={contractor.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {contractor.verificationStatus === 'verified' ? '✓ Verified' : 'Pending Verification'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Member since {new Date(contractor.createdAt || '').toLocaleDateString()}
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

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Available Opportunities */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Available Opportunities</CardTitle>
                <Button variant="ghost" size="sm">
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {opportunitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : opportunities && opportunities.length > 0 ? (
                <div className="space-y-4">
                  {opportunities.slice(0, 3).map((opportunity) => (
                    <OpportunityCard 
                      key={opportunity.id} 
                      opportunity={opportunity} 
                      contractorId={contractor.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No opportunities available at the moment.</p>
                </div>
              )}
            </CardContent>
          </Card>

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

        {/* Background Check Section */}
        {id && (
          <div className="space-y-6">
            <BackgroundCheckDashboard contractorId={id} />
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
