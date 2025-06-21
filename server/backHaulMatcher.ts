import { db } from './db';
import { jobs, jobPairs } from '../shared/schema';
import { eq, and, gte, lte, isNull, sql } from 'drizzle-orm';

interface Job {
  id: number;
  pickupLat: number;
  pickupLon: number;
  dropLat: number;
  dropLon: number;
  payAmount: number;
  earliestStart: Date;
  latestStart: Date;
  status: string;
  pairedJobId?: number;
}

interface BackHaulMatch {
  outboundJob: Job;
  returnJob: Job;
  score: number;
  deadheadDistance: number;
  totalPay: number;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
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

// Calculate match score based on deadhead distance and pay
function calculateMatchScore(deadheadDistance: number, returnPay: number): number {
  // Lower deadhead distance and higher pay = better score
  // Score ranges from 0-100, where 100 is perfect
  const maxDeadhead = 100; // miles
  const distanceScore = Math.max(0, (maxDeadhead - deadheadDistance) / maxDeadhead * 50);
  const payScore = Math.min(50, returnPay / 100); // $1 = 1 point, capped at 50
  
  return Math.round(distanceScore + payScore);
}

export class BackHaulMatcher {
  
  // Find best back-haul match for a given outbound job
  async findBackHaul(outboundJobId: number, radiusKm: number = 160): Promise<Job | null> {
    try {
      // Get the outbound job
      const outboundJob = await db.select()
        .from(jobs)
        .where(eq(jobs.id, outboundJobId))
        .limit(1);
      
      if (!outboundJob[0]) {
        throw new Error('Outbound job not found');
      }
      
      const outbound = outboundJob[0];
      
      // Convert radius from km to approximate lat/lon degrees
      const radiusDegrees = radiusKm / 111; // roughly 111 km per degree
      
      // Find candidate return loads near the outbound drop location
      const candidates = await db.select()
        .from(jobs)
        .where(
          and(
            eq(jobs.status, 'open'),
            isNull(jobs.pairedJobId),
            gte(jobs.pickupLat, (parseFloat(outbound.dropLat!) - radiusDegrees).toString()),
            lte(jobs.pickupLat, (parseFloat(outbound.dropLat!) + radiusDegrees).toString()),
            gte(jobs.pickupLon, (parseFloat(outbound.dropLon!) - radiusDegrees).toString()),
            lte(jobs.pickupLon, (parseFloat(outbound.dropLon!) + radiusDegrees).toString()),
            gte(jobs.earliestStart, outbound.latestStart) // Return job starts after outbound ends
          )
        );
      
      if (candidates.length === 0) {
        return null;
      }
      
      // Score and rank candidates
      let bestMatch: Job | null = null;
      let bestScore = -1;
      
      for (const candidate of candidates) {
        const deadheadDistance = calculateDistance(
          parseFloat(outbound.dropLat!),
          parseFloat(outbound.dropLon!),
          parseFloat(candidate.pickupLat!),
          parseFloat(candidate.pickupLon!)
        );
        
        // Skip if deadhead is too far
        if (deadheadDistance > radiusKm * 0.621371) { // Convert km to miles
          continue;
        }
        
        const score = calculateMatchScore(deadheadDistance, parseFloat(candidate.payAmount!));
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = candidate as Job;
        }
      }
      
      return bestMatch;
    } catch (error) {
      console.error('Error finding back-haul:', error);
      return null;
    }
  }
  
  // Create a job pair
  async createJobPair(outboundJobId: number, returnJobId: number): Promise<boolean> {
    try {
      // Get both jobs
      const [outboundJob, returnJob] = await Promise.all([
        db.select().from(jobs).where(eq(jobs.id, outboundJobId)).limit(1),
        db.select().from(jobs).where(eq(jobs.id, returnJobId)).limit(1)
      ]);
      
      if (!outboundJob[0] || !returnJob[0]) {
        throw new Error('One or both jobs not found');
      }
      
      const outbound = outboundJob[0];
      const returnLoad = returnJob[0];
      
      // Calculate metrics
      const deadheadDistance = calculateDistance(
        parseFloat(outbound.dropLat!),
        parseFloat(outbound.dropLon!),
        parseFloat(returnLoad.pickupLat!),
        parseFloat(returnLoad.pickupLon!)
      );
      
      const totalPay = parseFloat(outbound.payAmount!) + parseFloat(returnLoad.payAmount!);
      const score = calculateMatchScore(deadheadDistance, parseFloat(returnLoad.payAmount!));
      
      // Update jobs to link them
      await Promise.all([
        db.update(jobs)
          .set({ pairedJobId: returnJobId, updatedAt: new Date() })
          .where(eq(jobs.id, outboundJobId)),
        db.update(jobs)
          .set({ pairedJobId: outboundJobId, updatedAt: new Date() })
          .where(eq(jobs.id, returnJobId))
      ]);
      
      // Create job pair record for analytics
      await db.insert(jobPairs).values({
        outboundId: outboundJobId,
        returnId: returnJobId,
        score: score.toString(),
        deadheadDistance: deadheadDistance.toString(),
        totalPay: totalPay.toString()
      });
      
      return true;
    } catch (error) {
      console.error('Error creating job pair:', error);
      return false;
    }
  }
  
  // Automatically find and pair back-hauls for all unpaired jobs
  async buildBackHauls(): Promise<number> {
    try {
      // Get all open jobs without pairs
      const unpairedJobs = await db.select()
        .from(jobs)
        .where(
          and(
            eq(jobs.status, 'open'),
            isNull(jobs.pairedJobId)
          )
        );
      
      let pairsCreated = 0;
      
      for (const job of unpairedJobs) {
        const backHaul = await this.findBackHaul(job.id);
        
        if (backHaul) {
          const success = await this.createJobPair(job.id, backHaul.id);
          if (success) {
            pairsCreated++;
          }
        }
      }
      
      console.log(`Created ${pairsCreated} back-haul pairs`);
      return pairsCreated;
    } catch (error) {
      console.error('Error building back-hauls:', error);
      return 0;
    }
  }
  
  // Get paired jobs with full details
  async getPairedJobs(userId?: string): Promise<BackHaulMatch[]> {
    try {
      const query = db.select({
        outboundId: jobPairs.outboundId,
        returnId: jobPairs.returnId,
        score: jobPairs.score,
        deadheadDistance: jobPairs.deadheadDistance,
        totalPay: jobPairs.totalPay
      }).from(jobPairs);
      
      const pairs = await query;
      
      const matches: BackHaulMatch[] = [];
      
      for (const pair of pairs) {
        const [outboundJob, returnJob] = await Promise.all([
          db.select().from(jobs).where(eq(jobs.id, pair.outboundId!)).limit(1),
          db.select().from(jobs).where(eq(jobs.id, pair.returnId!)).limit(1)
        ]);
        
        if (outboundJob[0] && returnJob[0]) {
          matches.push({
            outboundJob: outboundJob[0] as Job,
            returnJob: returnJob[0] as Job,
            score: parseFloat(pair.score!),
            deadheadDistance: parseFloat(pair.deadheadDistance!),
            totalPay: parseFloat(pair.totalPay!)
          });
        }
      }
      
      return matches;
    } catch (error) {
      console.error('Error getting paired jobs:', error);
      return [];
    }
  }
}

export const backHaulMatcher = new BackHaulMatcher();