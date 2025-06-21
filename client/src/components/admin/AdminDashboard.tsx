import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  Activity, 
  Shield, 
  MessageSquare,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Globe
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  supportTickets: number;
  systemHealth: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActiveAt: string;
  createdAt: string;
}

interface ActivityLog {
  id: number;
  userId: string;
  action: string;
  resource: string;
  details: any;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, teamData, activityData] = await Promise.all([
        apiRequest('/api/admin/stats'),
        apiRequest('/api/admin/team'),
        apiRequest('/api/admin/activity?limit=50')
      ]);

      setStats(statsData);
      setTeamMembers(teamData);
      setActivityLogs(activityData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const inviteTeamMember = async (email: string, role: string) => {
    try {
      await apiRequest('/api/admin/team/invite', {
        method: 'POST',
        body: JSON.stringify({
          email,
          role,
          permissions: ['view_analytics'],
          languagePref: 'en'
        })
      });

      toast({
        title: "Invitation Sent",
        description: `Invited ${email} as ${role}`,
        variant: "default"
      });

      fetchAdminData();
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      });
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Warning</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      'super_admin': 'bg-purple-100 text-purple-800',
      'admin': 'bg-blue-100 text-blue-800',
      'member': 'bg-green-100 text-green-800',
      'viewer': 'bg-gray-100 text-gray-800'
    };
    
    return <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{role}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage ACHIEVEMOR platform operations</p>
          </div>
          <Button className="btn-primary">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Team Member
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeUsers} active this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total: ${stats?.totalRevenue.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.supportTickets}</div>
              <p className="text-xs text-muted-foreground">
                Open tickets pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                {getHealthBadge(stats?.systemHealth || 'unknown')}
              </div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="team" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="team">Team Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
            <TabsTrigger value="chat">Admin Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage admin team access and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getRoleBadge(member.role)}
                        <Badge variant={member.status === 'active' ? 'default' : 'outline'}>
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {teamMembers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No team members found. Invite your first team member to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure platform-wide settings and features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Translation Services</h4>
                        <p className="text-sm text-gray-600">Enable multilingual chat</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <Globe className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">AI Insights</h4>
                        <p className="text-sm text-gray-600">AI-powered business insights</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Choose 2 Matching</h4>
                        <p className="text-sm text-gray-600">Back-haul load matching</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">
                        Active
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Security Features</h4>
                        <p className="text-sm text-gray-600">Enhanced security protocols</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Enabled
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Monitor admin actions and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{log.action.replace('_', ' ')}</span>
                          {log.resource && <span className="text-gray-600"> on {log.resource}</span>}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Chat System</CardTitle>
                <CardDescription>
                  Multilingual team communication with real-time translation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-medium mb-2">Chat System</h3>
                  <p>Real-time multilingual chat functionality will be implemented here.</p>
                  <Button className="mt-4" variant="outline">
                    Start New Conversation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}