import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UniversalNav } from "@/components/UniversalNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Truck, DollarSign, Calendar, Filter, Search, Star, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    jobType: "all",
    payRange: "all",
    location: "all",
    experience: "all"
  });

  // Fetch opportunities
  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/opportunities', selectedFilters],
    retry: false,
  });

  // Fetch applied jobs
  const { data: appliedJobs, isLoading: appliedLoading } = useQuery({
    queryKey: ['/api/opportunities/applied'],
    retry: false,
  });

  // Apply to job mutation
  const applyToJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest("POST", "/api/opportunities/apply", { jobId });
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const handleApplyToJob = (jobId: string) => {
    applyToJobMutation.mutate(jobId);
  };

  const formatSalary = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case 'long-haul':
        return <Truck className="h-4 w-4" />;
      case 'local':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Truck className="h-4 w-4" />;
    }
  };

  const filteredOpportunities = opportunities?.filter((job: any) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <UniversalNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Job Opportunities</h1>
            <p className="text-gray-600 mt-2">Find your next driving opportunity</p>
          </div>

          <Tabs defaultValue="browse" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Browse Jobs
              </TabsTrigger>
              <TabsTrigger value="applied" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Applied Jobs
              </TabsTrigger>
              <TabsTrigger value="recommended" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Recommended
              </TabsTrigger>
            </TabsList>

            {/* Browse Jobs Tab */}
            <TabsContent value="browse">
              <div className="space-y-6">
                {/* Search and Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Search & Filter
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Search jobs, companies, or locations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <Button>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Select value={selectedFilters.jobType} onValueChange={(value) => 
                          setSelectedFilters(prev => ({ ...prev, jobType: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Job Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="long-haul">Long Haul</SelectItem>
                            <SelectItem value="local">Local Delivery</SelectItem>
                            <SelectItem value="regional">Regional</SelectItem>
                            <SelectItem value="owner-operator">Owner Operator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Select value={selectedFilters.payRange} onValueChange={(value) => 
                          setSelectedFilters(prev => ({ ...prev, payRange: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Pay Range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Ranges</SelectItem>
                            <SelectItem value="40-60k">$40k - $60k</SelectItem>
                            <SelectItem value="60-80k">$60k - $80k</SelectItem>
                            <SelectItem value="80k+">$80k+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Select value={selectedFilters.location} onValueChange={(value) => 
                          setSelectedFilters(prev => ({ ...prev, location: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            <SelectItem value="local">Within 50 miles</SelectItem>
                            <SelectItem value="regional">Regional</SelectItem>
                            <SelectItem value="national">National</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Select value={selectedFilters.experience} onValueChange={(value) => 
                          setSelectedFilters(prev => ({ ...prev, experience: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="entry">Entry Level</SelectItem>
                            <SelectItem value="experienced">Experienced</SelectItem>
                            <SelectItem value="senior">Senior Level</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Listings */}
                <div className="space-y-4">
                  {opportunitiesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading opportunities...</p>
                    </div>
                  ) : filteredOpportunities.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredOpportunities.map((job: any) => (
                      <Card key={job.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getJobTypeIcon(job.type)}
                                <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                                <Badge variant="secondary">{job.type}</Badge>
                                {job.featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                              </div>
                              
                              <div className="flex items-center gap-4 text-gray-600 mb-3">
                                <span className="font-medium text-gray-900">{job.company}</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {formatSalary(job.salaryMin, job.salaryMax)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {job.schedule}
                                </span>
                              </div>

                              <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                              <div className="flex items-center gap-2">
                                {job.requirements?.slice(0, 3).map((req: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {req}
                                  </Badge>
                                ))}
                                {job.requirements?.length > 3 && (
                                  <span className="text-sm text-gray-500">+{job.requirements.length - 3} more</span>
                                )}
                              </div>
                            </div>

                            <div className="ml-6 text-right">
                              <div className="text-sm text-gray-500 mb-2">Posted {job.postedDays} days ago</div>
                              <Button 
                                onClick={() => handleApplyToJob(job.id)}
                                disabled={applyToJobMutation.isPending || job.applied}
                                className={job.applied ? "bg-green-600 hover:bg-green-700" : ""}
                              >
                                {job.applied ? "Applied" : "Apply Now"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Applied Jobs Tab */}
            <TabsContent value="applied">
              <div className="space-y-4">
                {appliedLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your applications...</p>
                  </div>
                ) : appliedJobs?.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                      <p className="text-gray-600">Start browsing opportunities to apply for jobs</p>
                      <Button className="mt-4" onClick={() => setSearchTerm("")}>
                        Browse Jobs
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  appliedJobs?.map((application: any) => (
                    <Card key={application.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{application.job.title}</h3>
                              <Badge variant="secondary">{application.job.type}</Badge>
                              <Badge 
                                variant={
                                  application.status === 'accepted' ? 'default' :
                                  application.status === 'rejected' ? 'destructive' :
                                  'secondary'
                                }
                              >
                                {application.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-gray-600 mb-3">
                              <span className="font-medium text-gray-900">{application.job.company}</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {application.job.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Applied {application.appliedDate}
                              </span>
                            </div>

                            {application.notes && (
                              <p className="text-gray-700 mb-4">{application.notes}</p>
                            )}
                          </div>

                          <div className="ml-6 text-right">
                            <div className="text-sm text-gray-500">
                              Status: {application.status}
                            </div>
                            {application.status === 'pending' && (
                              <Button variant="outline" size="sm" className="mt-2">
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Recommended Jobs Tab */}
            <TabsContent value="recommended">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Personalized Recommendations
                  </CardTitle>
                  <CardDescription>
                    Jobs matched to your profile, experience, and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">AI-Powered Recommendations Coming Soon</h3>
                    <p className="text-gray-600 mb-4">
                      Complete your profile and upload your documents to receive personalized job recommendations
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => window.location.href = '/profile'}>
                        Complete Profile
                      </Button>
                      <Button variant="outline" onClick={() => window.location.href = '/glovebox'}>
                        Upload Documents
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}