import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Truck, 
  MapPin, 
  DollarSign, 
  Clock, 
  Package, 
  Route,
  ArrowRight,
  CheckCircle2,
  Target
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Job {
  id: number;
  title: string;
  description: string;
  pickupLocation: string;
  pickupLat: number;
  pickupLon: number;
  dropLocation: string;
  dropLat: number;
  dropLon: number;
  payAmount: number;
  currency: string;
  equipmentType: string;
  weight: number;
  distance: number;
  pairedJobId?: number;
  status: string;
  type: string;
  source: string;
  earliestStart: string;
  latestStart: string;
  createdAt: string;
}

interface JobPair {
  outboundJob: Job;
  returnJob: Job;
  score: number;
  deadheadDistance: number;
  totalPay: number;
}

export default function ChooseTwoJobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobPairs, setJobPairs] = useState<JobPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPairedOnly, setShowPairedOnly] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
    fetchJobPairs();
  }, [showPairedOnly, selectedEquipment]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (showPairedOnly) {
        params.append('paired', 'true');
      }
      
      if (selectedEquipment) {
        params.append('equipment', selectedEquipment);
      }
      
      const response = await apiRequest(`/api/jobs?${params.toString()}`);
      setJobs(response);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJobPairs = async () => {
    try {
      const response = await apiRequest('/api/jobs/pairs');
      setJobPairs(response);
    } catch (error) {
      console.error('Error fetching job pairs:', error);
    }
  };

  const pairJob = async (jobId: number) => {
    try {
      await apiRequest(`/api/jobs/${jobId}/pair`, { method: 'POST' });
      
      toast({
        title: "Success",
        description: "Back-haul match found and paired!",
        variant: "default"
      });
      
      fetchJobs();
      fetchJobPairs();
    } catch (error) {
      console.error('Error pairing job:', error);
      toast({
        title: "No Match Found",
        description: "No suitable back-haul opportunities available",
        variant: "destructive"
      });
    }
  };

  const buildAllBackhauls = async () => {
    try {
      const response = await apiRequest('/api/jobs/build-backhauls', { method: 'POST' });
      
      toast({
        title: "Back-hauls Built",
        description: `Created ${response.pairsCreated} new job pairs`,
        variant: "default"
      });
      
      fetchJobs();
      fetchJobPairs();
    } catch (error) {
      console.error('Error building back-hauls:', error);
      toast({
        title: "Error",
        description: "Failed to build back-hauls",
        variant: "destructive"
      });
    }
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'box_truck': return '📦';
      case 'sprinter': return '🚐';
      case 'flatbed': return '🚛';
      default: return '🚚';
    }
  };

  const getPayBadgeColor = (amount: number) => {
    if (amount >= 1000) return 'bg-green-100 text-green-800';
    if (amount >= 500) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const JobCard = ({ job, pairedJob }: { job: Job; pairedJob?: Job }) => (
    <Card className="premium-card group hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{getEquipmentIcon(job.equipmentType)}</span>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {job.title}
              </CardTitle>
              {job.pairedJobId && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Choose 2 Match
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm text-gray-600">
              {job.description}
            </CardDescription>
          </div>
          <Badge className={getPayBadgeColor(job.payAmount)}>
            ${job.payAmount.toLocaleString()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Route Information */}
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{job.pickupLocation}</span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{job.dropLocation}</span>
          <Badge variant="outline" className="ml-auto">
            {job.distance} mi
          </Badge>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-gray-500" />
            <span>{job.weight.toLocaleString()} lbs</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{new Date(job.earliestStart).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Paired Job Info */}
        {pairedJob && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center space-x-2 mb-2">
              <Route className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-700">Return Load</span>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{pairedJob.title}</span>
                <Badge className="bg-green-100 text-green-800">
                  +${pairedJob.payAmount.toLocaleString()}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-3 w-3" />
                <span>{pairedJob.pickupLocation} → {pairedJob.dropLocation}</span>
              </div>
              <div className="text-xs text-green-600 mt-1">
                Total Trip: ${(job.payAmount + pairedJob.payAmount).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Source: {job.source.toUpperCase()}</span>
            <span>Type: {job.equipmentType.replace('_', ' ')}</span>
          </div>
          
          {!job.pairedJobId && (
            <Button 
              size="sm" 
              onClick={() => pairJob(job.id)}
              className="btn-primary"
            >
              <Target className="h-4 w-4 mr-1" />
              Find Match
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'paired') return job.pairedJobId;
    if (activeTab === 'single') return !job.pairedJobId;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Choose 2 Load Board
          </h2>
          <p className="text-gray-600 mt-1">
            One load out, one load home—never haul dry.
          </p>
        </div>
        <Button onClick={buildAllBackhauls} variant="outline">
          <Route className="h-4 w-4 mr-2" />
          Build All Matches
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="paired-only"
                checked={showPairedOnly}
                onCheckedChange={setShowPairedOnly}
              />
              <Label htmlFor="paired-only">Show loads with back-haul only</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label>Equipment:</Label>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="">All Types</option>
                <option value="box_truck">Box Truck</option>
                <option value="sprinter">Sprinter</option>
                <option value="flatbed">Flatbed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="paired">
            Choose 2 Matches ({jobs.filter(j => j.pairedJobId).length})
          </TabsTrigger>
          <TabsTrigger value="single">
            Single Loads ({jobs.filter(j => !j.pairedJobId).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map(job => {
                const pairedJob = job.pairedJobId 
                  ? jobs.find(j => j.id === job.pairedJobId)
                  : undefined;
                
                return (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    pairedJob={pairedJob}
                  />
                );
              })}
            </div>
          )}
          
          {!loading && filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No jobs available
              </h3>
              <p className="text-gray-600">
                {showPairedOnly 
                  ? "No jobs with back-haul matches found. Try adjusting your filters."
                  : "No jobs match your current filters."
                }
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}