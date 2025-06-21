import { db } from './db';
import { jobs, users, contractors } from '../shared/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';

interface CarrierProfile {
  id: string;
  homeLat: number;
  homeLon: number;
  vehicles: string[];
  level: number;
  preferredRadius: number;
  preferredCategories: string[];
}

interface ScoredJob {
  job: any;
  score: number;
  factors: {
    distance: number;
    pay: number;
    category: number;
    level: number;
  };
}

// Calculate distance between two points using Haversine formula
function geoDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export class MatchingService {
  
  // Core scoring algorithm with weighted factors
  scoreJob(job: any, carrier: CarrierProfile): ScoredJob {
    // Distance penalty (km) - smaller is better
    const distWeight = 0.35;
    const distKm = geoDistance(
      carrier.homeLat, 
      carrier.homeLon,
      parseFloat(job.pickupLat), 
      parseFloat(job.pickupLon)
    );
    const distScore = Math.max(0, 200 - distKm); // Max distance penalty
    
    // Pay reward - higher is better
    const payWeight = 0.40;
    const payScore = parseFloat(job.payAmount) / 10; // Normalize to reasonable scale
    
    // Category alignment (carrier's preferred equipment)
    const catWeight = 0.15;
    const catScore = carrier.vehicles.includes(job.equipmentType) ? 100 : 50;
    
    // Loyalty/level bonus
    const levelWeight = 0.10;
    const levelScore = (carrier.level / 10) * 100; // Normalize to 0-100
    
    const rawScore = (
      distWeight * distScore +
      payWeight * payScore +
      catWeight * catScore +
      levelWeight * levelScore
    );
    
    return {
      job,
      score: Math.round(rawScore),
      factors: {
        distance: distScore,
        pay: payScore,
        category: catScore,
        level: levelScore
      }
    };
  }
  
  async getCarrierProfile(carrierId: string): Promise<CarrierProfile> {
    try {
      // Get user and contractor data
      const user = await db.select()
        .from(users)
        .where(eq(users.id, carrierId))
        .limit(1);
      
      const contractor = await db.select()
        .from(contractors)
        .where(eq(contractors.userId, carrierId))
        .limit(1);
      
      if (!user[0] || !contractor[0]) {
        throw new Error('Carrier profile not found');
      }
      
      // Default profile with mock data for demo
      return {
        id: carrierId,
        homeLat: parseFloat(contractor[0].businessAddress?.split(',')[0] || '33.7490'),
        homeLon: parseFloat(contractor[0].businessAddress?.split(',')[1] || '-84.3880'),
        vehicles: ['box_truck', 'sprinter'], // Would come from vehicle preferences
        level: 3, // Would come from achievement service
        preferredRadius: 200, // km
        preferredCategories: ['delivery', 'transport']
      };
    } catch (error) {
      console.error('Error getting carrier profile:', error);
      // Return default profile
      return {
        id: carrierId,
        homeLat: 33.7490,
        homeLon: -84.3880,
        vehicles: ['box_truck'],
        level: 1,
        preferredRadius: 100,
        preferredCategories: ['delivery']
      };
    }
  }
  
  async getPersonalizedMatches(carrierId: string, limit: number = 10): Promise<ScoredJob[]> {
    try {
      const carrier = await this.getCarrierProfile(carrierId);
      
      // Get available jobs (not paired, open status)
      const availableJobs = await db.select()
        .from(jobs)
        .where(and(
          eq(jobs.status, 'open'),
          isNull(jobs.pairedJobId)
        ))
        .limit(200); // Get larger set for scoring
      
      // Score all jobs
      const scoredJobs = availableJobs.map(job => this.scoreJob(job, carrier));
      
      // Sort by score descending and return top matches
      const topMatches = scoredJobs
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      
      return topMatches;
    } catch (error) {
      console.error('Error getting personalized matches:', error);
      return [];
    }
  }
  
  async getJobRecommendations(carrierId: string, filters: any = {}): Promise<ScoredJob[]> {
    try {
      const carrier = await this.getCarrierProfile(carrierId);
      
      // Build query with filters
      let query = db.select().from(jobs).where(eq(jobs.status, 'open'));
      
      if (filters.equipmentType) {
        query = query.where(eq(jobs.equipmentType, filters.equipmentType));
      }
      
      if (filters.minPay) {
        query = query.where(sql`${jobs.payAmount} >= ${filters.minPay}`);
      }
      
      if (filters.maxDistance) {
        // Would implement distance filtering with PostGIS in production
      }
      
      const filteredJobs = await query.limit(100);
      
      // Score and rank
      const scoredJobs = filteredJobs.map(job => this.scoreJob(job, carrier));
      
      return scoredJobs.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      return [];
    }
  }
  
  // Get jobs specifically good for backhaul pairing
  async getBackhaulCandidates(carrierId: string): Promise<ScoredJob[]> {
    try {
      const carrier = await this.getCarrierProfile(carrierId);
      
      // Get jobs that could form good backhaul pairs
      const candidateJobs = await db.select()
        .from(jobs)
        .where(and(
          eq(jobs.status, 'open'),
          isNull(jobs.pairedJobId)
        ))
        .limit(50);
      
      // Score with emphasis on pairing potential
      const scoredJobs = candidateJobs.map(job => {
        const baseScore = this.scoreJob(job, carrier);
        
        // Boost score for jobs that return near carrier's home
        const returnDistance = geoDistance(
          carrier.homeLat,
          carrier.homeLon, 
          parseFloat(job.dropLat),
          parseFloat(job.dropLon)
        );
        
        if (returnDistance < 50) { // Within 50km of home
          baseScore.score += 50; // Backhaul bonus
        }
        
        return baseScore;
      });
      
      return scoredJobs.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error getting backhaul candidates:', error);
      return [];
    }
  }
}

export const matchingService = new MatchingService();