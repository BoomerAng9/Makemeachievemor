import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, DollarSign, Truck, Star } from "lucide-react";

interface Job {
  id: string | number;
  posted_by?: string;
  assigned_to?: string | null;
  origin?: string;
  destination?: string;
  miles?: string | number;
  rate?: string | number;
  priority?: string;
  status: string;
  title?: string;
  description?: string | null;
  pickupTime?: string | Date | null;
  deliveryTime?: string | Date | null;
  requirements?: string[] | unknown;
  requestedAt?: string | Date | null;
  assignedAt?: string | Date | null;
  pickedUpAt?: string | Date | null;
  deliveredAt?: string | Date | null;
  paidAt?: string | Date | null;
  lockExpiresAt?: string | Date | null;
  // Legacy fields for compatibility
  contractorId?: number;
  opportunityId?: number;
  acceptedAt?: string | Date | null;
  completedAt?: string | Date | null;
  rating?: number | null;
  feedback?: string | null;
  // Database fields
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

interface JobOpportunitiesProps {
  opportunities: Job[];
  activeJobs: Job[];
  isLoading: boolean;
  userId: string;
}

export function JobOpportunities({ opportunities, activeJobs, isLoading, userId }: JobOpportunitiesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [requestingJobs, setRequestingJobs] = useState<Set<string>>(new Set());

  // Accept Job mutation - implements state machine: open -> requested
  const acceptJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return await apiRequest(`/api/jobs/${jobId}/accept`, "POST", { userId });
    },
    onMutate: (jobId) => {
      setRequestingJobs(prev => new Set(prev).add(jobId));
    },
    onSuccess: (_, jobId) => {
      toast({
        title: "Job Requested",
        description: "Your request has been sent to admin for verification.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      queryClient.invalidateQueries({ queryKey: [`/api/contractors/${userId}/jobs`] });
    },
    onError: (error: any, jobId) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to request job. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: (_, __, jobId) => {
      setRequestingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  });

  // Update Job Status mutation - implements state machine: assigned -> picked_up -> delivered
  const updateJobStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
      return await apiRequest(`/api/jobs/${jobId}/status`, "PATCH", { status, userId });
    },
    onSuccess: (_, { status }) => {
      const statusMessages = {
        picked_up: "Job marked as picked up",
        delivered: "Job marked as delivered"
      };
      toast({
        title: "Status Updated",
        description: statusMessages[status as keyof typeof statusMessages] || "Job status updated",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/contractors/${userId}/jobs`] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update job status.",
        variant: "destructive",
      });
    }
  });

  const handleAcceptJob = (jobId: string) => {
    acceptJobMutation.mutate(jobId);
  };

  const handleUpdateStatus = (jobId: string, status: string) => {
    updateJobStatusMutation.mutate({ jobId, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800";
      case "requested": return "bg-yellow-100 text-yellow-800";
      case "assigned": return "bg-green-100 text-green-800";
      case "picked_up": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-indigo-100 text-indigo-800";
      case "paid": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === "express" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800";
  };

  // Utility functions to handle data conversion
  const getMiles = (job: Job): number => {
    if (typeof job.miles === 'number') return job.miles;
    if (typeof job.miles === 'string') return parseFloat(job.miles) || 0;
    return 0;
  };

  const getRate = (job: Job): number => {
    if (typeof job.rate === 'number') return job.rate;
    if (typeof job.rate === 'string') return parseFloat(job.rate) || 0;
    return 0;
  };

  const getJobTitle = (job: Job): string => {
    return job.title || `${job.origin || 'Origin'} to ${job.destination || 'Destination'}`;
  };

  const getJobId = (job: Job): string => {
    return job.id?.toString() || '';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Available Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Available Jobs ({opportunities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No available jobs at the moment.</p>
          ) : (
            <div className="space-y-4">
              {opportunities.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{getJobTitle(job)}</h3>
                        <Badge className={getPriorityColor(job.priority || "standard")}>
                          {job.priority === "express" ? "⚡ Express" : "Standard"}
                        </Badge>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1).replace("_", " ")}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.origin} → {job.destination}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Truck className="h-4 w-4" />
                          <span>{getMiles(job)} miles</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-green-600">${getRate(job).toLocaleString()}</span>
                        </div>
                      </div>

                      {job.description && (
                        <p className="text-gray-600 text-sm mb-2">{job.description}</p>
                      )}



                      {job.pickupTime && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>Pickup: {new Date(job.pickupTime).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">${getRate(job).toLocaleString()}</div>
                        <div className="text-sm text-gray-500">${(getRate(job) / getMiles(job)).toFixed(2)}/mile</div>
                      </div>
                      
                      {job.status === "open" && (
                        <Button 
                          onClick={() => handleAcceptJob(getJobId(job))}
                          disabled={requestingJobs.has(getJobId(job))}
                          className="bg-primary hover:bg-primary/90 text-white px-6"
                        >
                          {requestingJobs.has(getJobId(job)) ? "Requesting..." : "Accept Job"}
                        </Button>
                      )}
                      
                      {job.status === "requested" && job.assigned_to === userId && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Awaiting Admin Approval
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Jobs */}
      {activeJobs && activeJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Active Jobs ({activeJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{getJobTitle(job)}</h3>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1).replace("_", " ")}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.origin} → {job.destination}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-green-600">${getRate(job).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Timeline Status */}
                      <div className="flex items-center space-x-4 text-xs">
                        <div className={`px-2 py-1 rounded ${job.assignedAt ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          Assigned {job.assignedAt ? `✓` : '○'}
                        </div>
                        <div className={`px-2 py-1 rounded ${job.pickedUpAt ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          Picked Up {job.pickedUpAt ? `✓` : '○'}
                        </div>
                        <div className={`px-2 py-1 rounded ${job.deliveredAt ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          Delivered {job.deliveredAt ? `✓` : '○'}
                        </div>
                        <div className={`px-2 py-1 rounded ${job.paidAt ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          Paid {job.paidAt ? `✓` : '○'}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {job.status === "assigned" && (
                        <Button 
                          onClick={() => handleUpdateStatus(getJobId(job), "picked_up")}
                          disabled={updateJobStatusMutation.isPending}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Mark Picked Up
                        </Button>
                      )}
                      
                      {job.status === "picked_up" && (
                        <Button 
                          onClick={() => handleUpdateStatus(getJobId(job), "delivered")}
                          disabled={updateJobStatusMutation.isPending}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Mark Delivered
                        </Button>
                      )}
                      
                      {job.status === "delivered" && (
                        <Badge className="bg-green-100 text-green-800">
                          Awaiting Payment
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}