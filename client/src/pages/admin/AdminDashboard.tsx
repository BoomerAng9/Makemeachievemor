import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Users,
  Settings,
  Activity,
  Shield,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Search,
  Filter,
  Download,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountStatus: string;
  verificationStatus: string;
  role: string;
  subscriptionStatus: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingVerifications: number;
  suspendedUsers: number;
  newRegistrationsToday: number;
  newRegistrationsThisWeek: number;
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActionDialog, setUserActionDialog] = useState(false);
  const [actionType, setActionType] = useState<string>("");
  const [actionReason, setActionReason] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin statistics
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  // Fetch all users with filtering
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users", searchTerm, statusFilter],
  });

  // Fetch admin activity log
  const { data: activityLog } = useQuery({
    queryKey: ["/api/admin/activity"],
  });

  // User action mutations
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, action, reason }: { userId: string; action: string; reason?: string }) => {
      return apiRequest(`/api/admin/users/${userId}/action`, {
        method: "POST",
        body: JSON.stringify({ action, reason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/activity"] });
      setUserActionDialog(false);
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User action completed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUserAction = (user: User, action: string) => {
    setSelectedUser(user);
    setActionType(action);
    setUserActionDialog(true);
  };

  const confirmUserAction = () => {
    if (selectedUser && actionType) {
      updateUserMutation.mutate({
        userId: selectedUser.id,
        action: actionType,
        reason: actionReason,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      pending_verification: "bg-yellow-100 text-yellow-800",
      suspended: "bg-red-100 text-red-800",
      banned: "bg-gray-100 text-gray-800",
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const getVerificationBadge = (status: string) => {
    const variants = {
      verified: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      unverified: "bg-gray-100 text-gray-800",
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const exportUsers = () => {
    if (users) {
      const csvContent = [
        ["ID", "Email", "Name", "Status", "Verification", "Role", "Subscription", "Created", "Last Login"].join(","),
        ...users.map(user => [
          user.id,
          user.email,
          `${user.firstName} ${user.lastName}`,
          user.accountStatus,
          user.verificationStatus,
          user.role,
          user.subscriptionStatus,
          format(new Date(user.createdAt), "yyyy-MM-dd"),
          user.lastLoginAt ? format(new Date(user.lastLoginAt), "yyyy-MM-dd") : "Never"
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage users, monitor platform activity, and configure settings
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={exportUsers} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Users
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.newRegistrationsThisWeek || 0} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently active accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingVerifications || 0}</div>
              <p className="text-xs text-muted-foreground">
                Require review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.newRegistrationsToday || 0}</div>
              <p className="text-xs text-muted-foreground">
                Registrations today
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="flex items-center gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending_verification">Pending Verification</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            Loading users...
                          </TableCell>
                        </TableRow>
                      ) : users?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        users?.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                                  <div className="text-sm text-gray-500">ID: {user.id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(user.accountStatus)}>
                                {user.accountStatus.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getVerificationBadge(user.verificationStatus)}>
                                {user.verificationStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize">{user.role}</TableCell>
                            <TableCell className="capitalize">{user.subscriptionStatus}</TableCell>
                            <TableCell>{format(new Date(user.createdAt), "MMM dd, yyyy")}</TableCell>
                            <TableCell>
                              {user.lastLoginAt 
                                ? format(new Date(user.lastLoginAt), "MMM dd, yyyy")
                                : "Never"
                              }
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUserAction(user, "view")}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUserAction(user, "edit")}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {user.accountStatus === "active" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUserAction(user, "suspend")}
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUserAction(user, "activate")}
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLog?.map((activity: any) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <Activity className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{activity.action.replace('_', ' ')}</p>
                          <span className="text-sm text-gray-500">
                            {format(new Date(activity.createdAt), "MMM dd, yyyy HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.actionDetails?.description || `Action performed on user ${activity.targetUserId}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Admin: {activity.adminUserId} | IP: {activity.ipAddress}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Registration Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Auto-approve new registrations</label>
                        <p className="text-sm text-gray-500">Users can access dashboard immediately after registration</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Admin notification email</label>
                        <Input value="contactus@achievemor.io" disabled className="mt-2" />
                        <p className="text-sm text-gray-500 mt-1">All registration notifications are sent here</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Action Dialog */}
      <Dialog open={userActionDialog} onOpenChange={setUserActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "view" && "View User Details"}
              {actionType === "edit" && "Edit User"}
              {actionType === "suspend" && "Suspend User"}
              {actionType === "activate" && "Activate User"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  {actionType === "view" && `Viewing details for ${selectedUser.firstName} ${selectedUser.lastName}`}
                  {actionType === "edit" && `Edit user information for ${selectedUser.firstName} ${selectedUser.lastName}`}
                  {actionType === "suspend" && `Suspend account for ${selectedUser.firstName} ${selectedUser.lastName}`}
                  {actionType === "activate" && `Activate account for ${selectedUser.firstName} ${selectedUser.lastName}`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {actionType === "suspend" && (
              <div>
                <label className="text-sm font-medium">Reason for suspension</label>
                <Textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter reason for suspension..."
                  className="mt-2"
                />
              </div>
            )}
            
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setUserActionDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmUserAction}
                disabled={updateUserMutation.isPending}
                variant={actionType === "suspend" ? "destructive" : "default"}
              >
                {updateUserMutation.isPending ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}