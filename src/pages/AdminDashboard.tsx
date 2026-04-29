import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Users, HardDrive, Globe, LogOut, BarChart3, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllUsers } from "@/hooks/useAllUsers";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { users, loading, error } = useAllUsers();
  const [selectedUser, setSelectedUser] = useState<(typeof users)[0] | null>(null);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Calculate stats
  const totalUsers = users.length;
  const totalStorage = users.reduce((sum, user) => sum + user.total_storage_bytes, 0);
  const totalSites = users.reduce((sum, user) => sum + user.sites_count, 0);
  const activeUsers = users.filter((u) => u.last_sign_in_at).length;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <a href="/" className="font-bold text-xl hover:opacity-80 transition-opacity">
              <span className="text-gradient-cheese">Brie</span>
              <span className="text-foreground">Hosting</span>
            </a>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:border-destructive hover:text-destructive transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">{activeUsers} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                Total Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(totalStorage)}</div>
              <p className="text-xs text-muted-foreground">Across all sites</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Active Sites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSites}</div>
              <p className="text-xs text-muted-foreground">Deployed websites</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Healthy</div>
              <p className="text-xs text-muted-foreground">All systems online</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="clients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
            <TabsTrigger value="resources">Proxmox Resources</TabsTrigger>
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Manage all platform users and view their resource usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground animate-pulse">Loading users...</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Storage</TableHead>
                          <TableHead>Sites</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Last Active</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                                {user.plan.replace("_", " ")}
                              </span>
                            </TableCell>
                            <TableCell>{formatBytes(user.total_storage_bytes)}</TableCell>
                            <TableCell>{user.sites_count}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {user.last_sign_in_at
                                ? formatDistanceToNow(new Date(user.last_sign_in_at), {
                                    addSuffix: true,
                                  })
                                : "Never"}
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedUser(user)}
                                  >
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>User Details</DialogTitle>
                                    <DialogDescription>
                                      {selectedUser?.email}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                          User ID
                                        </label>
                                        <p className="text-sm font-mono break-all">{selectedUser?.id}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                          Plan
                                        </label>
                                        <p className="text-sm font-medium capitalize">
                                          {selectedUser?.plan.replace("_", " ")}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                          Total Storage
                                        </label>
                                        <p className="text-sm font-medium">
                                          {formatBytes(selectedUser?.total_storage_bytes || 0)}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                          Active Sites
                                        </label>
                                        <p className="text-sm font-medium">{selectedUser?.sites_count}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                          Joined
                                        </label>
                                        <p className="text-sm">
                                          {selectedUser?.created_at
                                            ? new Date(selectedUser.created_at).toLocaleDateString()
                                            : "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                          Last Active
                                        </label>
                                        <p className="text-sm">
                                          {selectedUser?.last_sign_in_at
                                            ? new Date(selectedUser.last_sign_in_at).toLocaleDateString()
                                            : "Never"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="pt-4 border-t space-y-2">
                                      <Button className="w-full" variant="outline">
                                        Edit Plan
                                      </Button>
                                      <Button className="w-full" variant="destructive">
                                        Suspend User
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Supabase Activity Logs
                </CardTitle>
                <CardDescription>
                  Real-time authentication and database events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Activity className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Activity Logs Coming Soon</h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    We're integrating Supabase audit logs to show user logins, password changes, and
                    other authentication events. This feature will be available in the next update.
                  </p>
                  <div className="mt-6 p-4 rounded-lg bg-muted text-sm text-muted-foreground max-w-md">
                    <p className="font-mono text-xs">
                      📋 User Login Events
                      <br />
                      🔐 Password Changes
                      <br />
                      📧 Email Confirmations
                      <br />
                      🚫 Failed Attempts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Proxmox Resources Tab */}
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Proxmox Resource Usage
                </CardTitle>
                <CardDescription>
                  Virtual machine and infrastructure metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Proxmox Integration Coming Soon</h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    We're setting up Proxmox API integration to display real-time resource usage,
                    VM performance metrics, and infrastructure health.
                  </p>
                  <div className="mt-6 p-4 rounded-lg bg-muted text-sm text-muted-foreground max-w-md">
                    <p className="font-mono text-xs">
                      💻 CPU Usage
                      <br />
                      🧠 Memory Usage
                      <br />
                      💾 Storage Metrics
                      <br />
                      🌐 Network I/O
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
