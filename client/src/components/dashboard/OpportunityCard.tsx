import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAcceptOpportunity } from "@/hooks/useContractor";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock } from "lucide-react";
import type { Opportunity } from "@shared/schema";

interface OpportunityCardProps {
  opportunity: Opportunity;
  contractorId: number;
}

export function OpportunityCard({ opportunity, contractorId }: OpportunityCardProps) {
  const acceptOpportunity = useAcceptOpportunity();
  const { toast } = useToast();

  const handleAccept = async () => {
    try {
      await acceptOpportunity.mutateAsync({
        opportunityId: opportunity.id,
        contractorId,
      });
      
      toast({
        title: "Job accepted!",
        description: "You have successfully accepted this delivery job.",
      });
    } catch (error) {
      toast({
        title: "Error accepting job",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'express':
        return 'bg-green-100 text-green-800';
      case 'standard':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'commercial':
        return 'bg-blue-100 text-blue-800';
      case 'residential':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
          <p className="text-sm text-gray-500">
            {opportunity.description || `${opportunity.weight ? `${opportunity.weight} lbs • ` : ''}Delivery`}
          </p>
        </div>
        <span className="text-lg font-bold text-primary">
          ${opportunity.payment}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{opportunity.distance ? `${opportunity.distance} miles` : 'Distance TBD'}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          <span>
            Pickup: {opportunity.pickupTime 
              ? new Date(opportunity.pickupTime).toLocaleDateString()
              : 'TBD'
            }
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Badge className={getJobTypeColor(opportunity.jobType)}>
            {opportunity.jobType === 'express' ? 'Express' : 'Standard'}
          </Badge>
          <Badge className={getCategoryColor(opportunity.category)}>
            {opportunity.category === 'commercial' ? 'Commercial' : 'Residential'}
          </Badge>
        </div>
        <Button
          onClick={handleAccept}
          disabled={acceptOpportunity.isPending || opportunity.status !== 'available'}
          className="bg-accent hover:bg-accent/90 text-white text-sm"
        >
          {acceptOpportunity.isPending ? 'Accepting...' : 'Accept Job'}
        </Button>
      </div>
    </div>
  );
}
