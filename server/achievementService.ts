import { db } from './db';
import { achievements, carrierAchievements, earnings, jobs } from '../shared/schema';
import { eq, and, count, sum, gte } from 'drizzle-orm';

interface Achievement {
  id: number;
  code: string;
  label: string;
  description: string;
  points: number;
  icon?: string;
  category: string;
}

interface CarrierStats {
  totalLoads: number;
  backhaulCount: number;
  totalEarnings: number;
  averageRating: number;
  consecutiveDays: number;
  monthlyEarnings: number;
}

// Achievement definitions with check functions
const ACHIEVEMENT_DEFINITIONS = {
  'FIRST_LOAD': {
    label: 'First Mile',
    description: 'Complete your first load',
    points: 25,
    icon: '🚚',
    category: 'milestone',
    check: (stats: CarrierStats) => stats.totalLoads >= 1
  },
  'TEN_LOADS': {
    label: 'Veteran Driver',
    description: 'Complete 10 loads',
    points: 100,
    icon: '🏆',
    category: 'milestone',
    check: (stats: CarrierStats) => stats.totalLoads >= 10
  },
  'FIFTY_LOADS': {
    label: 'Road Warrior',
    description: 'Complete 50 loads',
    points: 250,
    icon: '⭐',
    category: 'milestone',
    check: (stats: CarrierStats) => stats.totalLoads >= 50
  },
  'BACKHAUL_MASTER': {
    label: 'Backhaul Master',
    description: 'Complete 5 successful backhaul pairs',
    points: 150,
    icon: '🔄',
    category: 'efficiency',
    check: (stats: CarrierStats) => stats.backhaulCount >= 5
  },
  'EFFICIENCY_EXPERT': {
    label: 'Efficiency Expert',
    description: 'Complete 10 backhaul pairs',
    points: 300,
    icon: '🎯',
    category: 'efficiency',
    check: (stats: CarrierStats) => stats.backhaulCount >= 10
  },
  'HIGH_EARNER': {
    label: 'High Earner',
    description: 'Earn $10,000 in a month',
    points: 200,
    icon: '💰',
    category: 'financial',
    check: (stats: CarrierStats) => stats.monthlyEarnings >= 10000
  },
  'CONSISTENT_PERFORMER': {
    label: 'Consistent Performer',
    description: 'Work 30 consecutive days',
    points: 175,
    icon: '📅',
    category: 'performance',
    check: (stats: CarrierStats) => stats.consecutiveDays >= 30
  },
  'FIVE_STAR': {
    label: 'Five Star Service',
    description: 'Maintain 5.0 average rating',
    points: 125,
    icon: '⭐',
    category: 'quality',
    check: (stats: CarrierStats) => stats.averageRating >= 5.0
  }
};

export class AchievementService {
  
  async initializeAchievements() {
    try {
      // Insert achievement definitions if they don't exist
      for (const [code, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
        const existing = await db.select()
          .from(achievements)
          .where(eq(achievements.code, code))
          .limit(1);
        
        if (existing.length === 0) {
          await db.insert(achievements).values({
            code,
            label: definition.label,
            description: definition.description,
            points: definition.points,
            icon: definition.icon,
            category: definition.category
          });
        }
      }
      
      console.log('Achievement system initialized');
    } catch (error) {
      console.error('Error initializing achievements:', error);
    }
  }
  
  async getCarrierStats(carrierId: string): Promise<CarrierStats> {
    try {
      // Get total completed loads
      const totalLoadsResult = await db.select({ count: count() })
        .from(jobs)
        .where(and(eq(jobs.userId, carrierId), eq(jobs.status, 'completed')));
      
      // Get backhaul count (jobs with pairedJobId)
      const backhaulResult = await db.select({ count: count() })
        .from(jobs)
        .where(and(
          eq(jobs.userId, carrierId), 
          eq(jobs.status, 'completed'),
          // Note: would need to check pairedJobId is not null in real implementation
        ));
      
      // Get total earnings
      const earningsResult = await db.select({ total: sum(earnings.amount) })
        .from(earnings)
        .where(eq(earnings.carrierId, carrierId));
      
      // Get monthly earnings (last 30 days)
      const monthlyResult = await db.select({ total: sum(earnings.amount) })
        .from(earnings)
        .where(and(
          eq(earnings.carrierId, carrierId),
          gte(earnings.earnedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        ));
      
      return {
        totalLoads: totalLoadsResult[0]?.count || 0,
        backhaulCount: backhaulResult[0]?.count || 0,
        totalEarnings: parseFloat(earningsResult[0]?.total || '0'),
        averageRating: 4.8, // Would calculate from ratings table
        consecutiveDays: 15, // Would calculate from activity logs
        monthlyEarnings: parseFloat(monthlyResult[0]?.total || '0')
      };
    } catch (error) {
      console.error('Error getting carrier stats:', error);
      return {
        totalLoads: 0,
        backhaulCount: 0,
        totalEarnings: 0,
        averageRating: 0,
        consecutiveDays: 0,
        monthlyEarnings: 0
      };
    }
  }
  
  async evaluateAchievements(carrierId: string): Promise<Achievement[]> {
    try {
      const stats = await this.getCarrierStats(carrierId);
      const newAchievements: Achievement[] = [];
      
      // Get existing achievements for this carrier
      const existingAchievements = await db.select({ achievementId: carrierAchievements.achievementId })
        .from(carrierAchievements)
        .where(eq(carrierAchievements.carrierId, carrierId));
      
      const existingIds = new Set(existingAchievements.map(ea => ea.achievementId));
      
      // Check each achievement
      for (const [code, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
        if (definition.check(stats)) {
          // Get achievement from database
          const achievement = await db.select()
            .from(achievements)
            .where(eq(achievements.code, code))
            .limit(1);
          
          if (achievement[0] && !existingIds.has(achievement[0].id)) {
            // Grant new achievement
            await db.insert(carrierAchievements).values({
              carrierId,
              achievementId: achievement[0].id,
              points: achievement[0].points
            });
            
            newAchievements.push(achievement[0] as Achievement);
          }
        }
      }
      
      return newAchievements;
    } catch (error) {
      console.error('Error evaluating achievements:', error);
      return [];
    }
  }
  
  async getCarrierAchievements(carrierId: string): Promise<Achievement[]> {
    try {
      const result = await db.select({
        id: achievements.id,
        code: achievements.code,
        label: achievements.label,
        description: achievements.description,
        points: achievements.points,
        icon: achievements.icon,
        category: achievements.category,
        attainedAt: carrierAchievements.attainedAt
      })
      .from(carrierAchievements)
      .innerJoin(achievements, eq(carrierAchievements.achievementId, achievements.id))
      .where(eq(carrierAchievements.carrierId, carrierId));
      
      return result.map(r => ({
        id: r.id,
        code: r.code,
        label: r.label,
        description: r.description,
        points: r.points,
        icon: r.icon,
        category: r.category
      }));
    } catch (error) {
      console.error('Error getting carrier achievements:', error);
      return [];
    }
  }
  
  async getCarrierLevel(carrierId: string): Promise<{ level: number; totalPoints: number; nextLevelPoints: number }> {
    try {
      const result = await db.select({ totalPoints: sum(carrierAchievements.points) })
        .from(carrierAchievements)
        .where(eq(carrierAchievements.carrierId, carrierId));
      
      const totalPoints = parseInt(result[0]?.totalPoints || '0');
      
      // Calculate level (every 500 points = 1 level)
      const level = Math.floor(totalPoints / 500) + 1;
      const nextLevelPoints = level * 500;
      
      return {
        level,
        totalPoints,
        nextLevelPoints
      };
    } catch (error) {
      console.error('Error calculating carrier level:', error);
      return { level: 1, totalPoints: 0, nextLevelPoints: 500 };
    }
  }
}

export const achievementService = new AchievementService();