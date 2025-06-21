import { db } from './db';
import { users, teamMembers, conversations, messages, adminSettings, translationCache, adminActivityLogs } from '../shared/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  languagePref: string;
}

interface TeamInvite {
  email: string;
  role: string;
  permissions: string[];
  languagePref?: string;
}

interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  originalContent?: string;
  language: string;
  translatedVersions?: Record<string, string>;
  createdAt: Date;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  supportTickets: number;
  systemHealth: string;
}

export class AdminService {
  
  // Authentication and authorization
  async authenticateAdmin(email: string, password: string): Promise<{ token: string; user: AdminUser } | null> {
    try {
      const user = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      if (!user[0] || !['admin', 'super_admin'].includes(user[0].role)) {
        return null;
      }
      
      const isValidPassword = await bcrypt.compare(password, user[0].passwordHash);
      if (!isValidPassword) {
        return null;
      }
      
      const adminUser: AdminUser = {
        id: user[0].id,
        name: user[0].firstName + ' ' + user[0].lastName,
        email: user[0].email,
        role: user[0].role,
        permissions: this.getRolePermissions(user[0].role),
        languagePref: 'en' // Would come from user preferences
      };
      
      const token = jwt.sign(
        { userId: user[0].id, role: user[0].role },
        process.env.JWT_SECRET || 'admin-secret',
        { expiresIn: '24h' }
      );
      
      // Log admin login
      await this.logActivity(user[0].id, 'admin_login', 'auth', null, { email });
      
      return { token, user: adminUser };
    } catch (error) {
      console.error('Admin authentication error:', error);
      return null;
    }
  }
  
  private getRolePermissions(role: string): string[] {
    const permissions = {
      'super_admin': [
        'manage_users', 'manage_team', 'manage_settings', 'view_analytics', 
        'manage_billing', 'manage_system', 'moderate_content', 'manage_translations'
      ],
      'admin': [
        'manage_users', 'manage_team', 'view_analytics', 
        'moderate_content', 'manage_translations'
      ],
      'member': ['view_analytics', 'moderate_content'],
      'viewer': ['view_analytics']
    };
    
    return permissions[role as keyof typeof permissions] || [];
  }
  
  // Team management
  async inviteTeamMember(ownerId: string, invite: TeamInvite): Promise<string> {
    try {
      const inviteToken = Math.random().toString(36).substring(2, 15);
      
      await db.insert(teamMembers).values({
        ownerId,
        name: invite.email.split('@')[0], // Temporary name
        email: invite.email,
        role: invite.role,
        inviteToken,
        languagePref: invite.languagePref || 'en',
        permissions: invite.permissions
      });
      
      // Send invitation email (would integrate with Resend)
      await this.sendInvitationEmail(invite.email, inviteToken, ownerId);
      
      await this.logActivity(ownerId, 'invite_team_member', 'team_members', null, { email: invite.email, role: invite.role });
      
      return inviteToken;
    } catch (error) {
      console.error('Error inviting team member:', error);
      throw error;
    }
  }
  
  async getTeamMembers(ownerId: string): Promise<any[]> {
    try {
      const members = await db.select()
        .from(teamMembers)
        .where(eq(teamMembers.ownerId, ownerId))
        .orderBy(desc(teamMembers.createdAt));
      
      return members;
    } catch (error) {
      console.error('Error getting team members:', error);
      return [];
    }
  }
  
  async updateTeamMember(memberId: number, updates: Partial<any>): Promise<boolean> {
    try {
      await db.update(teamMembers)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(teamMembers.id, memberId));
      
      return true;
    } catch (error) {
      console.error('Error updating team member:', error);
      return false;
    }
  }
  
  // Chat system with translation
  async createConversation(title: string, participants: string[], createdBy: string): Promise<number> {
    try {
      const result = await db.insert(conversations).values({
        title,
        participants,
        createdBy,
        lastMessageAt: new Date()
      }).returning({ id: conversations.id });
      
      return result[0].id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
  
  async sendMessage(conversationId: number, senderId: string, content: string, language: string = 'en'): Promise<ChatMessage> {
    try {
      const result = await db.insert(messages).values({
        conversationId,
        senderId,
        content,
        originalContent: content,
        language
      }).returning();
      
      // Update conversation last message time
      await db.update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, conversationId));
      
      return result[0] as ChatMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  async translateMessage(messageId: number, targetLang: string): Promise<string> {
    try {
      const message = await db.select()
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);
      
      if (!message[0]) {
        throw new Error('Message not found');
      }
      
      // Check translation cache first
      const cached = await this.getCachedTranslation(message[0].content, message[0].language, targetLang);
      if (cached) {
        return cached;
      }
      
      // Translate using external service (mock for now)
      const translatedText = await this.performTranslation(message[0].content, targetLang);
      
      // Cache the translation
      await this.cacheTranslation(message[0].content, message[0].language, targetLang, translatedText);
      
      // Update message with translation
      const existingTranslations = message[0].translatedVersions || {};
      existingTranslations[targetLang] = translatedText;
      
      await db.update(messages)
        .set({ translatedVersions: existingTranslations })
        .where(eq(messages.id, messageId));
      
      return translatedText;
    } catch (error) {
      console.error('Error translating message:', error);
      throw error;
    }
  }
  
  private async getCachedTranslation(sourceText: string, sourceLang: string, targetLang: string): Promise<string | null> {
    try {
      const cached = await db.select()
        .from(translationCache)
        .where(and(
          eq(translationCache.sourceText, sourceText),
          eq(translationCache.sourceLang, sourceLang),
          eq(translationCache.targetLang, targetLang)
        ))
        .limit(1);
      
      if (cached[0]) {
        // Update cache hits
        await db.update(translationCache)
          .set({ cacheHits: sql`${translationCache.cacheHits} + 1` })
          .where(eq(translationCache.id, cached[0].id));
        
        return cached[0].translatedText;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached translation:', error);
      return null;
    }
  }
  
  private async cacheTranslation(sourceText: string, sourceLang: string, targetLang: string, translatedText: string): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 day TTL
      
      await db.insert(translationCache).values({
        sourceText,
        sourceLang,
        targetLang,
        translatedText,
        expiresAt
      });
    } catch (error) {
      console.error('Error caching translation:', error);
    }
  }
  
  private async performTranslation(text: string, targetLang: string): Promise<string> {
    // Mock translation for demo - would integrate with DeepL, Google Translate, etc.
    const translations: Record<string, Record<string, string>> = {
      'hello': { 'es': 'hola', 'fr': 'bonjour', 'de': 'hallo' },
      'welcome': { 'es': 'bienvenido', 'fr': 'bienvenue', 'de': 'willkommen' },
      'thank you': { 'es': 'gracias', 'fr': 'merci', 'de': 'danke' }
    };
    
    const lowerText = text.toLowerCase();
    return translations[lowerText]?.[targetLang] || `[${targetLang.toUpperCase()}] ${text}`;
  }
  
  // Settings management
  async updateSetting(key: string, value: any, category: string, updatedBy: string): Promise<boolean> {
    try {
      await db.insert(adminSettings).values({
        key,
        value,
        category,
        updatedBy
      }).onConflictDoUpdate({
        target: adminSettings.key,
        set: {
          value,
          updatedBy,
          updatedAt: new Date()
        }
      });
      
      await this.logActivity(updatedBy, 'update_setting', 'admin_settings', key, { key, category });
      
      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      return false;
    }
  }
  
  async getSetting(key: string): Promise<any> {
    try {
      const setting = await db.select()
        .from(adminSettings)
        .where(eq(adminSettings.key, key))
        .limit(1);
      
      return setting[0]?.value || null;
    } catch (error) {
      console.error('Error getting setting:', error);
      return null;
    }
  }
  
  // Analytics and stats
  async getAdminStats(): Promise<AdminStats> {
    try {
      // Get user counts
      const totalUsersResult = await db.select({ count: count() }).from(users);
      const activeUsersResult = await db.select({ count: count() })
        .from(users)
        .where(sql`${users.lastLoginAt} > NOW() - INTERVAL '30 days'`);
      
      return {
        totalUsers: totalUsersResult[0].count,
        activeUsers: activeUsersResult[0].count,
        totalRevenue: 125000, // Would come from earnings/billing tables
        monthlyRevenue: 15000,
        supportTickets: 23,
        systemHealth: 'healthy'
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        supportTickets: 0,
        systemHealth: 'unknown'
      };
    }
  }
  
  // Activity logging
  async logActivity(userId: string, action: string, resource: string, resourceId: string | null, details: any): Promise<void> {
    try {
      await db.insert(adminActivityLogs).values({
        userId,
        action,
        resource,
        resourceId,
        details
      });
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }
  
  async getActivityLogs(limit: number = 100): Promise<any[]> {
    try {
      const logs = await db.select()
        .from(adminActivityLogs)
        .orderBy(desc(adminActivityLogs.createdAt))
        .limit(limit);
      
      return logs;
    } catch (error) {
      console.error('Error getting activity logs:', error);
      return [];
    }
  }
  
  // Email integration
  private async sendInvitationEmail(email: string, token: string, ownerName: string): Promise<void> {
    // Mock email sending - would integrate with Resend
    console.log(`Sending invitation email to ${email} with token ${token} from ${ownerName}`);
  }
}

export const adminService = new AdminService();