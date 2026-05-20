import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Users, HardDrive, Globe, LogOut, BarChart3, Activity, ShieldAlert, Server, Megaphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllUsers } from "@/hooks/useAllUsers";
import type { StatusIncidentSeverity, StatusIncidentStatus } from "@/hooks/useAllUsers";
import type { PlanId } from "@/lib/plans";
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PLAN_OPTIONS: PlanId[] = ["none", "smol_brie", "thicc_brie", "mega_brie", "admin"];
const INCIDENT_STATUS_OPTIONS: StatusIncidentStatus[] = ["investigating", "identified", "monitoring", "resolved"];
const INCIDENT_SEVERITY_OPTIONS: StatusIncidentSeverity[] = ["notice", "degraded", "outage"];

const defaultIncidentForm = {
  title: "",
  service: "Platform",
  status: "investigating" as StatusIncidentStatus,
  severity: "degraded" as StatusIncidentSeverity,
  description: "",
};

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    users,
    sites,
    activity,
    securityAlerts,
    statusIncidents,
    loading,
    error,
    statusCounts,
    totalStorageBytes,
    proxmoxAttachedSites,
    updateUserPlan,
    createStatusIncident,
    updateStatusIncident,
    resolveStatusIncident,
  } = useAllUsers();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanId | "">("");
  const [savingPlan, setSavingPlan] = useState(false);
  const [selectedSecurityAlertId, setSelectedSecurityAlertId] = useState<string | null>(null);
  const [incidentForm, setIncidentForm] = useState(defaultIncidentForm);
  const [submittingIncident, setSubmittingIncident] = useState(false);
  const [updatingIncidentId, setUpdatingIncidentId] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const selectedSecurityAlert = securityAlerts.find((alert) => alert.id === selectedSecurityAlertId) ?? null;

  const totalUsers = users.length;
  const totalStorage = totalStorageBytes;
  const totalSites = users.reduce((sum, user) => sum + user.sites_count, 0);
  const activeUsers = users.filter((u) => {
    const lastUpdate = new Date(u.updated_at).getTime();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return lastUpdate >= sevenDaysAgo;
  }).length;
  const failedSites = statusCounts.failed;
  const liveSites = statusCounts.live;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const openUserDialog = (userId: string, plan: PlanId) => {
    setSelectedUserId(userId);
    setSelectedPlan(plan);
  };

  const openSecurityAlert = (alertId: string) => {
    setSelectedSecurityAlertId(alertId);
  };

  const handleSavePlan = async () => {
    if (!selectedUser || !selectedPlan) return;

    setSavingPlan(true);
    const { error: updateError } = await updateUserPlan(selectedUser.id, selectedPlan);
    setSavingPlan(false);

    if (updateError) {
      toast({
        title: "Failed to update plan",
        description: updateError,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Plan updated",
      description: `User plan changed to ${selectedPlan.replace("_", " ")}.`,
    });
  };

  const handleCreateIncident = async () => {
    if (!incidentForm.title.trim() || !incidentForm.service.trim() || !incidentForm.description.trim()) {
      toast({
        title: "Missing incident details",
        description: "Add a title, service, and description before publishing.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingIncident(true);
    const { error: createError } = await createStatusIncident({
      ...incidentForm,
      title: incidentForm.title.trim(),
      service: incidentForm.service.trim(),
      description: incidentForm.description.trim(),
    });
    setSubmittingIncident(false);

    if (createError) {
      toast({
        title: "Failed to publish incident",
        description: createError,
        variant: "destructive",
      });
      return;
    }

    setIncidentForm(defaultIncidentForm);
    toast({
      title: "Incident published",
      description: "The public status page will show it on the next refresh.",
    });
  };

  const handleUpdateIncidentStatus = async (incidentId: string, status: StatusIncidentStatus) => {
    setUpdatingIncidentId(incidentId);
    const { error: updateError } = await updateStatusIncident(incidentId, {
      status,
      resolved_at: status === "resolved" ? new Date().toISOString() : null,
    });
    setUpdatingIncidentId(null);

    if (updateError) {
      toast({
        title: "Failed to update incident",
        description: updateError,
        variant: "destructive",
      });
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    setUpdatingIncidentId(incidentId);
    const { error: resolveError } = await resolveStatusIncident(incidentId);
    setUpdatingIncidentId(null);

    if (resolveError) {
      toast({
        title: "Failed to resolve incident",
        description: resolveError,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Incident resolved",
      description: "The public status page now marks it as resolved.",
    });
  };

  const sortedUsersByStorage = [...users]
    .sort((a, b) => b.total_storage_bytes - a.total_storage_bytes)
    .slice(0, 8);

  const storageDenominator = sortedUsersByStorage[0]?.total_storage_bytes || 1;

  return (
    <div className="min-h-screen bg-background">
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

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
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
              <p className="text-xs text-muted-foreground">{activeUsers} updated in the last 7 days</p>
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
              <div className={`text-2xl font-bold ${failedSites > 0 ? "text-yellow-500" : "text-green-500"}`}>
                {failedSites > 0 ? "Degraded" : "Healthy"}
              </div>
              <p className="text-xs text-muted-foreground">
                {liveSites} live / {failedSites} failed sites
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="clients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="status">Public Status</TabsTrigger>
            <TabsTrigger value="security">Security Alerts</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
            <TabsTrigger value="resources">Proxmox Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Manage all platform users and view their resource usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-md border border-primary/30 bg-primary/10 p-3 text-xs text-primary">
                  User emails and auth events are not exposed by Supabase client APIs. This view uses secure user IDs from your app tables.
                </div>
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
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Storage</TableHead>
                          <TableHead>Sites</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.display_name || user.id.slice(0, 8)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{user.email || "—"}</TableCell>
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
                              {formatDistanceToNow(new Date(user.updated_at), {
                                addSuffix: true,
                              })}
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openUserDialog(user.id, user.plan)}
                                  >
                                    Manage
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>User Details</DialogTitle>
                                    <DialogDescription>
                                      {selectedUser?.display_name || selectedUser?.email || selectedUser?.id}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                          Email
                                        </label>
                                        <p className="text-sm">{selectedUser?.email || "Not provided"}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                          Display Name
                                        </label>
                                        <p className="text-sm">{selectedUser?.display_name || "Not provided"}</p>
                                      </div>
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
                                          {selectedUser?.updated_at
                                            ? new Date(selectedUser.updated_at).toLocaleDateString()
                                            : "Unknown"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="pt-4 border-t space-y-2">
                                      <label className="text-sm font-medium text-muted-foreground">Plan</label>
                                      <Select
                                        value={selectedPlan || undefined}
                                        onValueChange={(value) => setSelectedPlan(value as PlanId)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {PLAN_OPTIONS.map((plan) => (
                                            <SelectItem key={plan} value={plan}>
                                              {plan.replace("_", " ")}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Button className="w-full" onClick={handleSavePlan} disabled={!selectedPlan || savingPlan}>
                                        {savingPlan ? "Saving..." : "Save Plan"}
                                      </Button>
                                      <Button
                                        className="w-full"
                                        variant="destructive"
                                        onClick={async () => {
                                          if (!selectedUser) return;
                                          setSavingPlan(true);
                                          const { error: updateError } = await updateUserPlan(selectedUser.id, "none");
                                          setSavingPlan(false);
                                          if (updateError) {
                                            toast({
                                              title: "Suspend failed",
                                              description: updateError,
                                              variant: "destructive",
                                            });
                                            return;
                                          }
                                          setSelectedPlan("none");
                                          toast({
                                            title: "User suspended",
                                            description: "Plan set to none.",
                                          });
                                        }}
                                        disabled={savingPlan}
                                      >
                                        Suspend (set plan to none)
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

          <TabsContent value="status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Public Status Incidents
                </CardTitle>
                <CardDescription>
                  Publish manual incident entries for the public /status page. Security scan failures stay private in Security Alerts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                  Use this only for platform-facing incidents such as DNS, deployment pipeline, SSL, control panel, or planned maintenance events.
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="incident-title">Title</Label>
                    <Input
                      id="incident-title"
                      value={incidentForm.title}
                      onChange={(event) => setIncidentForm({ ...incidentForm, title: event.target.value })}
                      placeholder="Deployment pipeline delays"
                      maxLength={120}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="incident-service">Service</Label>
                    <Input
                      id="incident-service"
                      value={incidentForm.service}
                      onChange={(event) => setIncidentForm({ ...incidentForm, service: event.target.value })}
                      placeholder="Deployments"
                      maxLength={80}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={incidentForm.status}
                      onValueChange={(value) => setIncidentForm({ ...incidentForm, status: value as StatusIncidentStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INCIDENT_STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select
                      value={incidentForm.severity}
                      onValueChange={(value) => setIncidentForm({ ...incidentForm, severity: value as StatusIncidentSeverity })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INCIDENT_SEVERITY_OPTIONS.map((severity) => (
                          <SelectItem key={severity} value={severity}>
                            {severity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="incident-description">Description</Label>
                    <Textarea
                      id="incident-description"
                      value={incidentForm.description}
                      onChange={(event) => setIncidentForm({ ...incidentForm, description: event.target.value })}
                      placeholder="Describe what is affected, who is impacted, and what the team is doing."
                      className="min-h-28"
                      maxLength={2000}
                    />
                  </div>
                </div>

                <Button onClick={handleCreateIncident} disabled={submittingIncident}>
                  {submittingIncident ? "Publishing..." : "Publish Incident"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incident History</CardTitle>
                <CardDescription>
                  The public status page shows unresolved incidents first, then recent resolved incidents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statusIncidents.length === 0 ? (
                  <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                    No public incidents have been published yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {statusIncidents.map((incident) => (
                      <div key={incident.id} className="rounded-md border border-border bg-card p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{incident.service}</Badge>
                              <Badge
                                variant="outline"
                                className={
                                  incident.severity === "outage"
                                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                                    : incident.severity === "degraded"
                                      ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-600"
                                      : "border-primary/40 bg-primary/10 text-primary"
                                }
                              >
                                {incident.severity}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={
                                  incident.status === "resolved"
                                    ? "border-accent/40 bg-accent/10 text-accent"
                                    : "border-yellow-500/40 bg-yellow-500/10 text-yellow-600"
                                }
                              >
                                {incident.status}
                              </Badge>
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{incident.title}</h3>
                              <p className="mt-1 text-sm text-muted-foreground">{incident.description}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Started {formatDistanceToNow(new Date(incident.started_at), { addSuffix: true })}
                              {incident.resolved_at
                                ? ` · Resolved ${formatDistanceToNow(new Date(incident.resolved_at), { addSuffix: true })}`
                                : ""}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 lg:justify-end">
                            <Select
                              value={incident.status}
                              onValueChange={(value) => void handleUpdateIncidentStatus(incident.id, value as StatusIncidentStatus)}
                              disabled={updatingIncidentId === incident.id}
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {INCIDENT_STATUS_OPTIONS.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {incident.status !== "resolved" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => void handleResolveIncident(incident.id)}
                                disabled={updatingIncidentId === incident.id}
                              >
                                Resolve
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Supabase Activity Logs
                </CardTitle>
                <CardDescription>
                  Database activity derived from profiles and sites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                  Supabase Auth audit logs (login/password changes) require server-side access and are not available via the browser anon key.
                </div>
                {activity.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No activity yet.</div>
                ) : (
                  <div className="space-y-3">
                    {activity.slice(0, 50).map((event) => {
                      const isFailure = event.kind === "site_failed";
                      const eventIcons = {
                        profile_created: "👤",
                        profile_updated: "📊",
                        site_uploaded: "📦",
                        site_updated: "🔄",
                        site_failed: "❌",
                      };
                      return (
                        <div
                          key={event.id}
                          className={`rounded-md border p-3 transition-colors ${
                            isFailure
                              ? "border-destructive/30 bg-destructive/5"
                              : "border-border bg-card hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2 text-sm font-semibold">
                                <span className="text-lg">{eventIcons[event.kind]}</span>
                                <span>{event.summary}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                  Security Alerts
                </CardTitle>
                <CardDescription>
                  Upload failures and security scan failures with uploader context and failure reasons
                </CardDescription>
              </CardHeader>
              <CardContent>
                {securityAlerts.length === 0 ? (
                  <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                    No security alerts right now.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {securityAlerts.map((alert) => {
                      const isScanFailure = alert.status === "scan_failed";
                      return (
                        <div
                          key={alert.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => openSecurityAlert(alert.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              openSecurityAlert(alert.id);
                            }
                          }}
                          className={`cursor-pointer rounded-md border p-4 transition hover:border-primary/50 hover:bg-muted/40 ${
                            isScanFailure ? "border-destructive/40 bg-destructive/5" : "border-yellow-500/30 bg-yellow-500/5"
                          }`}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`px-2 py-1 text-xs font-semibold ${
                                    isScanFailure
                                      ? "border-destructive/40 bg-destructive/15 text-destructive"
                                      : "border-yellow-500/30 bg-yellow-500/15 text-yellow-600"
                                  }`}
                                >
                                  {alert.status.replace(/_/g, " ")}
                                </Badge>
                                <span className="text-sm font-semibold text-foreground">{alert.site_name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Uploaded by <span className="text-foreground font-medium">{alert.uploader_name}</span>
                                {alert.uploader_email ? <span> ({alert.uploader_email})</span> : null}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium text-foreground">Reason:</span> {alert.reason}
                              </p>
                            </div>
                            <div className="text-xs text-muted-foreground md:text-right">
                              <p>Created {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</p>
                              <p>Updated {formatDistanceToNow(new Date(alert.updated_at), { addSuffix: true })}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Proxmox Resource Usage
                </CardTitle>
                <CardDescription>
                  Resource metrics derived from deployed sites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="rounded-md border border-border p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        Proxmox Attachment
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {proxmoxAttachedSites}/{sites.length} sites have a VMID attached
                      </p>
                      <Progress
                        value={sites.length > 0 ? (proxmoxAttachedSites / sites.length) * 100 : 0}
                      />
                    </div>

                    <div className="rounded-md border border-border p-4">
                      <h3 className="font-semibold mb-2">Site Status Distribution</h3>
                      <div className="space-y-3">
                        {(["live", "provisioning", "uploaded", "failed", "scan_failed"] as const).map((status) => {
                          const count = statusCounts[status] || 0;
                          const percentage = sites.length > 0 ? (count / sites.length) * 100 : 0;
                          return (
                            <div key={status}>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="capitalize">{status.replace(/_/g, " ")}</span>
                                <span className="text-muted-foreground">{count}</span>
                              </div>
                              <Progress value={percentage} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border border-border p-4">
                    <h3 className="font-semibold mb-3">Top Users by Storage</h3>
                    {sortedUsersByStorage.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No user storage data yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {sortedUsersByStorage.map((user) => (
                          <div key={user.id}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="font-medium">{user.display_name || user.email || user.id.slice(0, 8)}</span>
                              <span className="text-muted-foreground">{formatBytes(user.total_storage_bytes)}</span>
                            </div>
                            <Progress value={(user.total_storage_bytes / storageDenominator) * 100} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={selectedSecurityAlert !== null} onOpenChange={(open) => !open && setSelectedSecurityAlertId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Security Alert</DialogTitle>
            <DialogDescription>
              Details for the selected upload failure or scan failure.
            </DialogDescription>
          </DialogHeader>

          {selectedSecurityAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Site</p>
                  <p className="text-sm font-medium text-foreground">{selectedSecurityAlert.site_name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                  <p className="text-sm font-medium text-foreground">{selectedSecurityAlert.status.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Uploaded by</p>
                  <p className="text-sm font-medium text-foreground">{selectedSecurityAlert.uploader_name}</p>
                  {selectedSecurityAlert.uploader_email && (
                    <p className="text-xs text-muted-foreground">{selectedSecurityAlert.uploader_email}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Reason</p>
                  <p className="text-sm font-medium text-foreground">{selectedSecurityAlert.reason}</p>
                </div>
              </div>

              <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p>Created {formatDistanceToNow(new Date(selectedSecurityAlert.created_at), { addSuffix: true })}</p>
                <p>Updated {formatDistanceToNow(new Date(selectedSecurityAlert.updated_at), { addSuffix: true })}</p>
              </div>

              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {selectedSecurityAlert.status === "scan_failed"
                  ? "Security verification failed for this upload. The website could not be verified as safe."
                  : "Upload failed and requires review."}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
