import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useSites, type Site, type SiteStatus } from "@/hooks/useSites";
import { ADMIN_PLAN, PLANS, type CustomerPlanId, type PlanId } from "@/lib/plans";
import { supabase } from "@/lib/supabase";
import { BriehostApiError, createPaymentIntent } from "@/lib/briehostApi";
import {
  Activity,
  BarChart3,
  Bell,
  CreditCard,
  Database,
  FileText,
  Globe,
  HardDrive,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  MessageSquare,
  Plus,
  Rocket,
  Search,
  Settings,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  Wifi,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SiteUploadDialog from "@/components/SiteUploadDialog";

const PUBLIC_DOMAIN = import.meta.env.VITE_PUBLIC_DOMAIN || "briehosting.be";

const STATUS_STYLES: Record<SiteStatus, string> = {
  uploaded: "bg-muted text-muted-foreground border border-muted",
  scanning: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  provisioning: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  live: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  failed: "bg-destructive/20 text-destructive border border-destructive/30",
  scan_failed: "bg-destructive/20 text-destructive border border-destructive/30",
};

const STATUS_LABEL: Record<SiteStatus, string> = {
  uploaded: "Uploaded",
  scanning: "Scanning…",
  provisioning: "Provisioning…",
  live: "Live",
  failed: "Failed",
  scan_failed: "Scan Failed",
};

const formatSiteSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const getPublicUrl = (site: Site) => (
  site.subdomain ? `https://${site.subdomain}.${PUBLIC_DOMAIN}` : null
);

const deploymentSteps: Array<{ status: SiteStatus; label: string }> = [
  { status: "uploaded", label: "Uploaded" },
  { status: "scanning", label: "Scanning" },
  { status: "provisioning", label: "Provisioning" },
  { status: "live", label: "Live" },
];

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, updatePlan } = useProfile();
  const { sites, loading: sitesLoading, error: sitesError, refetch: refetchSites } = useSites();
  const navigate = useNavigate();
  const [changingPlan, setChangingPlan] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<PlanId | null>(null);
  const [showAllSites, setShowAllSites] = useState(false);
  const [copiedSiteId, setCopiedSiteId] = useState<string | null>(null);

  const handleCopyUrl = async (siteId: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSiteId(siteId);
      setTimeout(() => setCopiedSiteId((id) => (id === siteId ? null : id)), 1500);
    } catch {
      // clipboard blocked — silently ignore, user can still click the link
    }
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [howToOpen, setHowToOpen] = useState(false);
  const [supportTicketOpen, setSupportTicketOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({ email: user?.email || "", subject: "", message: "" });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "status" | "date" | "size">("date");
  const [scanFailedSiteId, setScanFailedSiteId] = useState<string | null>(null);
  const [detailsSiteId, setDetailsSiteId] = useState<string | null>(null);
  const [manageSiteId, setManageSiteId] = useState<string | null>(null);
  const [manageForm, setManageForm] = useState({ name: "", domain: "" });
  const [manageError, setManageError] = useState<string | null>(null);
  const [manageSaving, setManageSaving] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSelectPlan = async (planId: PlanId) => {
    if (profile?.plan === "admin" || profile?.plan === planId) return;
    setPendingPlanId(planId);
    setConfirmOpen(true);
  };

  const handleConfirmPlan = async () => {
    if (!pendingPlanId) {
      setConfirmOpen(false);
      return;
    }

    setChangingPlan(true);
    try {
      // Free / "none" tier downgrade doesn't require payment — flip directly.
      // Everything else routes through Stripe Checkout (Phase 1: card only).
      // Phase 3 will replace this with a proper provider picker + skip path.
      if (pendingPlanId === "none" || pendingPlanId === "admin") {
        await updatePlan(pendingPlanId);
        setConfirmOpen(false);
        setPendingPlanId(null);
        return;
      }

      const { checkoutUrl } = await createPaymentIntent(pendingPlanId, "stripe");
      // Hard redirect to Stripe's hosted checkout. They bounce back to
      // /payment-return/:intentId, where PaymentReturnPage polls until the
      // webhook lands and flips the plan.
      window.location.href = checkoutUrl;
      // No state cleanup on the success path — the page is unmounting.
    } catch (err) {
      const msg = err instanceof BriehostApiError ? err.message : String(err);
      console.error("Plan upgrade failed:", msg);
      window.alert(`Couldn't start checkout: ${msg}`);
      setConfirmOpen(false);
      setPendingPlanId(null);
    } finally {
      setChangingPlan(false);
    }
  };

  const handleDeleteSite = (siteId: string) => {
    setSiteToDelete(siteId);
    setDeleteConfirmOpen(true);
  };

  const selectedScanFailedSite = sites.find((site) => site.id === scanFailedSiteId) ?? null;
  const selectedDetailsSite = sites.find((site) => site.id === detailsSiteId) ?? null;
  const selectedManageSite = sites.find((site) => site.id === manageSiteId) ?? null;

  const openManageDialog = (site: Site) => {
    setManageSiteId(site.id);
    setManageForm({
      name: site.name,
      domain: site.subdomain ?? "",
    });
    setManageError(null);
  };

  const closeManageDialog = () => {
    setManageSiteId(null);
    setManageError(null);
    setManageSaving(false);
  };

  const handleSaveManage = async () => {
    if (!selectedManageSite || !user?.id) return;

    const nextName = manageForm.name.trim();
    const nextDomain = manageForm.domain.trim().toLowerCase();

    if (!nextName) {
      setManageError("Site name is required.");
      return;
    }

    if (nextDomain && !/^[a-z0-9-]+$/.test(nextDomain)) {
      setManageError("Domain can only contain lowercase letters, numbers, and hyphens.");
      return;
    }

    setManageSaving(true);
    setManageError(null);
    try {
      const { error } = await supabase
        .from("sites")
        .update({
          name: nextName,
          subdomain: nextDomain || null,
        })
        .eq("id", selectedManageSite.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      await refetchSites();
      closeManageDialog();
    } catch (error) {
      console.error("Failed to update site settings:", error);
      setManageError("Couldn't save changes. Please try again.");
      setManageSaving(false);
    }
  };

  const openScanFailedDialog = (siteId: string) => {
    setScanFailedSiteId(siteId);
  };

  const closeScanFailedDialog = () => {
    setScanFailedSiteId(null);
  };

  const handleConfirmDelete = async () => {
    if (siteToDelete) {
      setDeletingId(siteToDelete);
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        
        if (!token) {
          throw new Error("Not authenticated");
        }

        const baseUrl = import.meta.env.VITE_BRIEHOST_API_URL;
        const response = await fetch(`${baseUrl}/api/sites/${siteToDelete}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete site");
        }

        await refetchSites();
      } catch (error) {
        console.error("Failed to delete site:", error);
      } finally {
        setDeletingId(null);
        setDeleteConfirmOpen(false);
        setSiteToDelete(null);
      }
    }
  };

  const currentPlan =
    profile?.plan === "admin"
      ? ADMIN_PLAN
      : profile?.plan && profile.plan !== "none"
        ? PLANS[profile.plan as CustomerPlanId]
        : null;

  const pendingPlan = pendingPlanId ? PLANS[pendingPlanId] : null;
  const liveSitesCount = sites.filter((site) => site.status === "live").length;

  // Filter sites by search query
  const filteredSites = sites.filter((site) =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.original_filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort sites
  const sortedSites = [...filteredSites].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "status":
        return a.status.localeCompare(b.status);
      case "date":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "size":
        return b.size_bytes - a.size_bytes;
      default:
        return 0;
    }
  });

  // Calculate storage usage
  const totalStorageUsed = sites.reduce((sum, site) => sum + site.size_bytes, 0);
  const totalStorageMB = totalStorageUsed / 1024 / 1024;
  const planStorage = currentPlan?.storage || 0;
  const storageUsagePercent = planStorage > 0 ? Math.min((totalStorageMB / planStorage) * 100, 100) : 0;

  // Export CSV function
  const exportToCSV = () => {
    const headers = ["Site Name", "Filename", "Status", "Size (MB)", "Uploaded Date"];
    const rows = sites.map((site) => [
      site.name,
      site.original_filename,
      STATUS_LABEL[site.status],
      (site.size_bytes / 1024 / 1024).toFixed(1),
      new Date(site.created_at).toLocaleDateString(),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `briehosting-sites-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const sectionIds = ["overview", "projects", "upload", "plan", "analytics", "billing", "support", "settings"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.1, 0.25, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const selectedDetailsPublicUrl = selectedDetailsSite ? getPublicUrl(selectedDetailsSite) : null;
  const selectedDetailsStepIndex = selectedDetailsSite
    ? deploymentSteps.findIndex((step) => step.status === selectedDetailsSite.status)
    : -1;

  if (sitesError) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Unable to load your sites</h2>
              <p className="text-sm text-destructive/90">
                Something went wrong while fetching your sites. Please try again.
              </p>
              <p className="text-xs text-destructive/80 mt-1 break-words">{sitesError}</p>
            </div>
            <button
              type="button"
              onClick={() => void refetchSites()}
              className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground scroll-smooth">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-yellow-500/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <div className="relative flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col border-r border-border bg-card/40 backdrop-blur-sm sticky top-0 h-screen">
          <div className="px-6 py-6 border-b border-border">
            <Link to="/" className="font-bold text-2xl tracking-tight hover:opacity-90 transition-opacity">
              <span className="text-gradient-cheese">Brie</span>
              <span className="text-foreground">Hosting</span>
            </Link>
            <p className="text-xs text-muted-foreground font-meme mt-1">Premium hosting with a cheesy smile.</p>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <a
              href="#overview"
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeSection === "overview"
                  ? "border border-border/60 bg-background/60 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-primary" />
              Dashboard
            </a>
            <a
              href="#projects"
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
                activeSection === "projects"
                  ? "bg-muted/40 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Globe className="h-4 w-4 text-yellow-400" />
              My Sites
            </a>
            <a
              href="#upload"
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
                activeSection === "upload"
                  ? "bg-muted/40 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Upload className="h-4 w-4 text-yellow-400" />
              Upload Site
            </a>
            <a
              href="#plan"
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
                activeSection === "plan"
                  ? "bg-muted/40 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-yellow-400" />
              Plans
            </a>
            <a
              href="#analytics"
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
                activeSection === "analytics"
                  ? "bg-muted/40 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <BarChart3 className="h-4 w-4 text-yellow-400" />
              Analytics
            </a>
            <a
              href="#billing"
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
                activeSection === "billing"
                  ? "bg-muted/40 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <CreditCard className="h-4 w-4 text-yellow-400" />
              Billing
            </a>
            <a
              href="#support"
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
                activeSection === "support"
                  ? "bg-muted/40 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <LifeBuoy className="h-4 w-4 text-yellow-400" />
              Support
            </a>
            <a
              href="/account-settings"
              className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
            >
              <Settings2 className="h-4 w-4 text-yellow-400" />
              Settings
            </a>
          </nav>
          <div className="px-6 pb-6">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground font-meme">Everything is running smoothly</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Live Sites</span>
                <span className="text-sm text-yellow-300 font-semibold">{liveSitesCount}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-300 transition-all duration-500"
                  style={{ width: `${sites.length > 0 ? Math.min((liveSitesCount / sites.length) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
            <div className="flex flex-col gap-4 px-4 py-4 lg:px-8 lg:py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-muted/50 p-2 text-yellow-300">🧀</div>
                  <div>
                    <p className="text-xs text-muted-foreground font-meme">Your dashboard is ready</p>
                    <p className="text-lg font-semibold text-foreground">Welcome back, {user?.email?.split("@")[0] || "Chef"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {profile?.plan === "admin" && (
                    <>
                      <span className="hidden sm:inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        Admin
                      </span>
                      <Link
                        to="/admin"
                        className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-yellow-400/70 transition"
                      >
                        Admin Dashboard
                      </Link>
                    </>
                  )}
                  <Link
                    to="/account-settings"
                    className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-yellow-400/70 transition"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground hover:border-yellow-400/70 transition"
                    aria-label="Sign out"
                  >
                    <span className="text-sm">→</span>
                  </button>
                  <Link
                    to="/account-settings"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-foreground hover:border-yellow-400/70 transition"
                  >
                    <span className="h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs">
                      {(user?.email?.[0] || "U").toUpperCase()}
                    </span>
                    {user?.email?.split("@")[0] || "User"}
                  </Link>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card/70 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/40"
                    placeholder="Search sites by name or filename..."
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-yellow-500/90 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400 transition"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Site
                  </button>
                  {currentPlan && currentPlan !== ADMIN_PLAN && (
                    <a
                      href="#plan"
                      className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-yellow-400/70 transition"
                    >
                      <Rocket className="h-4 w-4" />
                      Upgrade Plan
                    </a>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 pb-16 pt-8 lg:px-8">
            {/* Overview Section */}
            <section id="overview" className="mb-10 scroll-mt-28">
              <div className="rounded-3xl border border-border bg-card/70 p-6 lg:p-8 shadow-lg shadow-black/10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-meme">Fun branding, serious performance</p>
                    <h1 className="mt-2 text-3xl font-bold text-foreground lg:text-4xl">
                      Deploy fresh updates without the crumbs.
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                      Everything you need to launch, manage, and scale your BrieHosting projects in one premium dashboard.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-background/60 p-4">
                      <p className="text-xs text-muted-foreground">Active sites</p>
                      <p className="mt-2 text-2xl font-semibold">{sites.length}</p>
                      <p className="text-xs text-accent">Live data</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/60 p-4">
                      <p className="text-xs text-muted-foreground">Current plan</p>
                      <p className="mt-2 text-2xl font-semibold">{currentPlan?.name.split(" ")[0] || "None"}</p>
                      <p className="text-xs text-yellow-300">Active</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/60 p-4">
                      <p className="text-xs text-muted-foreground">Live status</p>
                      <p className="mt-2 text-2xl font-semibold">{liveSitesCount}</p>
                      <p className="text-xs text-emerald-300">Online</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 scroll-mt-28">
              {[
                { label: "Active Sites", value: sites.length.toString(), icon: Globe },
                { label: "Current Plan", value: currentPlan?.name || "None", icon: ShieldCheck },
                { label: "Live Sites", value: liveSitesCount.toString(), icon: Wifi },
                { label: "Monthly Sites", value: (sites.length > 0 ? "Active" : "—"), icon: Users },
                { label: "Uptime", value: "99.9%", icon: Activity },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <span className="rounded-lg bg-muted/70 p-2 text-yellow-300">
                      <item.icon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </section>

            {/* Projects Section */}
            <section id="projects" className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] scroll-mt-28">
              <div id="upload" className="rounded-3xl border border-border bg-card/70 p-6 scroll-mt-28">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold">Your Sites</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "name" | "status" | "date" | "size")}
                      className="rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/40"
                    >
                      <option value="date">Sort: Newest</option>
                      <option value="name">Sort: Name</option>
                      <option value="status">Sort: Status</option>
                      <option value="size">Sort: Size</option>
                    </select>
                    {sites.length > 0 && (
                      <button
                        onClick={exportToCSV}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-yellow-400/70 transition"
                      >
                        ↓ Export CSV
                      </button>
                    )}
                    <button
                      onClick={() => setUploadOpen(true)}
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-yellow-400/70 transition"
                    >
                      <Plus className="h-4 w-4" />
                      New Site
                    </button>
                  </div>
                </div>
                {currentPlan && (
                  <div className="mt-4 rounded-2xl border border-border bg-background/60 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Storage Usage</span>
                      <span className="text-xs font-semibold text-foreground">{totalStorageMB.toFixed(1)} GB / {planStorage} GB</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          storageUsagePercent > 80
                            ? "bg-gradient-to-r from-red-400 to-red-500"
                            : storageUsagePercent > 50
                              ? "bg-gradient-to-r from-yellow-400 to-amber-300"
                              : "bg-gradient-to-r from-yellow-400 to-amber-300"
                        }`}
                        style={{ width: `${storageUsagePercent}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="mt-5 space-y-3">
                  {sitesLoading ? (
                    <div className="rounded-2xl border border-border bg-background/60 p-6 text-sm text-muted-foreground animate-pulse">
                      Loading your sites...
                    </div>
                  ) : sites.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-background/60 p-8 text-center">
                      <div className="text-2xl mb-2">📦</div>
                      <p className="text-sm font-semibold text-foreground mb-1">No sites yet</p>
                      <p className="text-xs text-muted-foreground mb-4">Upload your first .zip to get cookin'!</p>
                      <button
                        onClick={() => setUploadOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-yellow-500/90 px-4 py-2 text-xs font-semibold text-black hover:bg-yellow-400 transition"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Site Now
                      </button>
                    </div>
                  ) : searchQuery && filteredSites.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-background/60 p-6 text-center">
                      <p className="text-sm text-muted-foreground">No sites match "{searchQuery}"</p>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-2 text-xs text-yellow-400 hover:text-yellow-300 transition"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    sortedSites.map((site) => {
                      const publicUrl = getPublicUrl(site);
                      return (
                        <div
                          key={site.id}
                          className="rounded-2xl border border-border bg-background/60 p-5 transition hover:border-yellow-400/50 hover:shadow-lg hover:shadow-black/15"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-muted-foreground truncate">{site.original_filename}</p>
                              <h3 className="mt-1 text-lg font-semibold text-foreground truncate">{site.name}</h3>
                              {publicUrl ? (
                                <div className="mt-2 flex items-center gap-2 rounded-lg border border-yellow-400/30 bg-yellow-500/5 px-3 py-2">
                                  <Globe className="h-4 w-4 shrink-0 text-yellow-300" />
                                  <a
                                    href={publicUrl}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="flex-1 truncate text-sm font-medium text-yellow-200 hover:text-yellow-100 transition"
                                    title={publicUrl}
                                  >
                                    {site.subdomain}.{PUBLIC_DOMAIN}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => void handleCopyUrl(site.id, publicUrl)}
                                    className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-yellow-200 hover:bg-yellow-500/10 transition"
                                    aria-label="Copy URL"
                                    title={copiedSiteId === site.id ? "Copied!" : "Copy URL"}
                                  >
                                    {copiedSiteId === site.id ? (
                                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                  <a
                                    href={publicUrl}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-yellow-200 hover:bg-yellow-500/10 transition"
                                    aria-label="Open site"
                                    title="Open in new tab"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                </div>
                              ) : site.status === "live" ? (
                                <p className="mt-2 text-xs text-muted-foreground">URL pending…</p>
                              ) : null}
                          </div>
                          {site.status === "scan_failed" ? (
                            <button
                              type="button"
                              onClick={() => openScanFailedDialog(site.id)}
                              className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap transition hover:scale-[1.02] hover:shadow-md ${STATUS_STYLES[site.status]}`}
                            >
                              {STATUS_LABEL[site.status]}
                            </button>
                          ) : (
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${STATUS_STYLES[site.status]}`}>
                              {STATUS_LABEL[site.status]}
                            </span>
                          )}
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground">
                          <p>Size: {(site.size_bytes / 1024 / 1024).toFixed(1)} MB</p>
                          <p>Uploaded: {new Date(site.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => openManageDialog(site)}
                            className="rounded-full border border-border bg-muted/40 text-muted-foreground px-3 py-1.5 transition hover:text-foreground hover:border-yellow-400/70"
                          >
                            Manage
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailsSiteId(site.id)}
                            className="rounded-full border border-border bg-muted/40 text-muted-foreground px-3 py-1.5 transition hover:text-foreground hover:border-yellow-400/70"
                          >
                            Details
                          </button>
                          {(site.status === "failed" || site.status === "scan_failed") && (
                            <button className="rounded-full border border-border bg-muted/40 text-muted-foreground px-3 py-1.5 transition hover:text-foreground hover:border-yellow-400/70">
                              Retry
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSite(site.id)}
                            className="rounded-full border border-destructive/40 bg-destructive/10 text-destructive px-3 py-1.5 transition hover:text-destructive hover:border-destructive/70 hover:bg-destructive/20 flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })
                  )}
                </div>
              </div>

              {/* Upload Center */}
              <div className="rounded-3xl border border-border bg-card/70 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Upload Center</h2>
                  <button
                    type="button"
                    onClick={() => setUploadOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-yellow-400/70 transition"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </button>
                </div>
                <div className="mt-5 rounded-2xl border border-dashed border-yellow-400/40 bg-background/50 p-5 text-center">
                  <p className="text-sm font-semibold">Drop your .zip site here</p>
                  <p className="mt-2 text-xs text-muted-foreground">We will deploy it fresh and crispy.</p>
                  <button
                    type="button"
                    onClick={() => setUploadOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-yellow-500/90 px-4 py-2 text-xs font-semibold text-black hover:bg-yellow-400 transition"
                  >
                    <Plus className="h-4 w-4" />
                    Choose File
                  </button>
                </div>
              </div>
            </section>

            {/* Plan Section */}
            <section id="plan" className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3 scroll-mt-28">
              <div className="lg:col-span-2 rounded-3xl border border-border bg-card/70 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Upgrade Plans</h2>
                  <span className="text-xs text-muted-foreground">Brie-style pricing</span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {(Object.entries(PLANS) as [PlanId, typeof PLANS[keyof typeof PLANS]][]).map(([planId, plan]) => {
                    const isActive = profile?.plan === planId;
                    return (
                      <div
                        key={planId}
                        className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${
                          isActive
                            ? "border-yellow-400/70 bg-yellow-500/10"
                            : plan.popular
                              ? "border-primary/70 bg-primary/10"
                              : "border-border bg-background/60"
                        }`}
                      >
                        <div className="text-center mb-3">
                          <p className="text-2xl mb-1">{plan.meme}</p>
                          <p className="text-sm text-muted-foreground">{plan.name}</p>
                        </div>
                        <p className="text-center text-2xl font-semibold text-foreground">
                          {plan.price}
                          <span className="text-xs text-muted-foreground">/mo</span>
                        </p>
                        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                          {plan.features.slice(0, 3).map((feature) => (
                            <li key={feature} className="truncate">{feature}</li>
                          ))}
                        </ul>
                        <button
                          onClick={() => handleSelectPlan(planId)}
                          disabled={isActive || changingPlan || profile?.plan === "admin"}
                          className={`mt-4 w-full rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            isActive
                              ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
                              : plan.popular
                                ? "bg-yellow-500/90 text-black hover:bg-yellow-400"
                                : "border border-border text-muted-foreground hover:text-foreground hover:border-yellow-400/70"
                          }`}
                        >
                          {isActive ? "Current plan ✓" : changingPlan ? "Updating..." : "Choose plan"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current Plan Card */}
              <div id="billing" className="rounded-3xl border border-border bg-card/70 p-6 scroll-mt-28">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Current Plan</h2>
                  <button className="text-xs text-yellow-300 hover:text-yellow-200 transition">Manage</button>
                </div>
                {currentPlan ? (
                  <div className="mt-5 rounded-2xl border border-border bg-background/60 p-5">
                    <div>
                      <p className="text-sm text-muted-foreground">Active plan</p>
                      <p className="text-2xl font-semibold">{currentPlan.name}</p>
                    </div>
                    <div className="mt-3 text-right">
                      <p className="text-sm text-muted-foreground">{currentPlan.price}/month</p>
                      <p className="text-xs text-yellow-300">Billing active</p>
                    </div>
                    <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                      {currentPlan.features.slice(0, 4).map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-accent" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-border bg-background/60 p-5 text-xs text-muted-foreground text-center">
                    No plan selected. Choose one from the plans above.
                  </div>
                )}
              </div>
            </section>

            {/* Analytics Section */}
            <section id="analytics" className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3 scroll-mt-28">
              <div className="lg:col-span-2 rounded-3xl border border-border bg-card/70 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Activity & Stats</h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <LineChart className="h-4 w-4" />
                    Live data
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-sm text-muted-foreground">Total Sites</p>
                    <p className="mt-3 text-2xl font-semibold">{sites.length}</p>
                    <p className="text-xs text-muted-foreground mt-2">Uploaded</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-sm text-muted-foreground">Live Sites</p>
                    <p className="mt-3 text-2xl font-semibold">{liveSitesCount}</p>
                    <p className="text-xs text-emerald-300 mt-2">Running</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-sm text-muted-foreground">Provisioning</p>
                    <p className="mt-3 text-2xl font-semibold">{sites.filter((s) => s.status === "provisioning").length}</p>
                    <p className="text-xs text-yellow-300 mt-2">In progress</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="mt-3 text-2xl font-semibold">
                      {sites.filter((s) => s.status === "failed" || s.status === "scan_failed").length}
                    </p>
                    <p className="text-xs text-destructive mt-2">Attention needed</p>
                  </div>
                </div>
              </div>

              {/* Support Card */}
              <div id="support" className="rounded-3xl border border-border bg-card/70 p-6 scroll-mt-28">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Support</h2>
                  <span className="text-xs text-muted-foreground">We're here</span>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setHowToOpen(true)}
                    className="w-full rounded-2xl border border-border bg-background/60 p-3 text-left text-xs transition hover:border-yellow-400/70 flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-yellow-300 shrink-0" />
                    How To
                  </button>
                  <button
                    onClick={() => setSupportTicketOpen(true)}
                    className="w-full rounded-2xl border border-border bg-background/60 p-3 text-left text-xs transition hover:border-yellow-400/70 flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4 text-yellow-300 shrink-0" />
                    Support Ticket
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Plan Change Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="border border-border bg-card/95 shadow-2xl shadow-black/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-foreground">
              Switch to {pendingPlan?.name ?? "this plan"}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {pendingPlanId && pendingPlanId !== "none" && pendingPlanId !== "admin" ? (
                <>
                  You'll be redirected to Stripe to pay {pendingPlan?.price ?? ""} for{" "}
                  {pendingPlan?.name ?? "this plan"}. (Test mode — no real money moves.
                  Use card <span className="font-mono">4242 4242 4242 4242</span> with any
                  future date and CVC.)
                </>
              ) : (
                <>
                  You are about to move to {pendingPlan?.name ?? "the selected plan"}.
                  Your plan updates instantly.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">What you get</p>
            <ul className="space-y-1">
              {(pendingPlan?.features ?? []).slice(0, 5).map((feature) => (
                <li key={feature} className="text-xs flex items-center gap-2">
                  <Check className="h-3 w-3 text-accent" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-transparent text-muted-foreground hover:text-foreground">
              Keep current plan
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPlan}
              disabled={changingPlan}
              className="bg-yellow-500/90 text-black hover:bg-yellow-400 disabled:opacity-50"
            >
              {changingPlan
                ? "Working…"
                : pendingPlanId && pendingPlanId !== "none" && pendingPlanId !== "admin"
                  ? "Continue to checkout 🧀"
                  : "Confirm switch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Site Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="border border-border bg-card/95 shadow-2xl shadow-black/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-foreground">
              Remove site?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This action cannot be undone. The site and all its data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-transparent text-muted-foreground hover:text-foreground">
              Keep site
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deletingId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {deletingId ? "Removing..." : "Remove site"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* How To Guide Modal */}
      <AlertDialog open={howToOpen} onOpenChange={setHowToOpen}>
        <AlertDialogContent className="border border-border bg-card/95 shadow-2xl shadow-black/40 max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-foreground">How to use BrieHosting</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">📤 Uploading a Site</h3>
              <ul className="space-y-1 text-xs">
                <li>1. Click the "Upload Site" button in the header or "Choose File" in the Upload Center</li>
                <li>2. Select your website .zip file (must contain index.html)</li>
                <li>3. Wait for upload to complete - site will be provisioned automatically</li>
                <li>4. Monitor status from "Your Sites" section</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">⚙️ Managing Sites</h3>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Manage:</strong> Update site settings and configuration</li>
                <li>• <strong>Details:</strong> View site information, file size, and upload date</li>
                <li>• <strong>Retry:</strong> Reprocess failed deployments</li>
                <li>• <strong>Remove:</strong> Delete a site (permanently irreversible)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">💰 Plans &amp; Billing</h3>
              <p className="text-xs">Choose your plan based on needs. Current plan shows your limits. Upgrade anytime from the Plans section - changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">📊 Viewing Stats</h3>
              <p className="text-xs">Check the Analytics section for your site statistics. Monitor active sites, deployment status, and resource usage.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">🆘 Need Help?</h3>
              <p className="text-xs">Use the Support section to submit a ticket or check documentation.</p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-transparent">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Support Ticket Modal */}
      <AlertDialog open={supportTicketOpen} onOpenChange={setSupportTicketOpen}>
        <AlertDialogContent className="border border-border bg-card/95 shadow-2xl shadow-black/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-foreground">Submit Support Ticket</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Email</label>
              <input
                type="email"
                value={ticketForm.email}
                onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/40"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Subject</label>
              <input
                type="text"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/40"
                placeholder="e.g., Site upload failed"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Message</label>
              <textarea
                value={ticketForm.message}
                onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/40 resize-none h-24"
                placeholder="Describe your issue in detail..."
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-transparent text-muted-foreground hover:text-foreground" disabled={submittingTicket}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!ticketForm.email || !ticketForm.subject || !ticketForm.message) {
                  alert("Please fill in all fields");
                  return;
                }
                setSubmittingTicket(true);
                try {
                  const response = await fetch("/api/support/ticket", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: ticketForm.email,
                      subject: ticketForm.subject,
                      message: ticketForm.message,
                      userId: user?.id,
                    }),
                  });
                  if (response.ok) {
                    alert("Support ticket submitted! We'll get back to you soon.");
                    setTicketForm({ email: user?.email || "", subject: "", message: "" });
                    setSupportTicketOpen(false);
                  } else {
                    alert("Failed to submit ticket. Please try again.");
                  }
                } catch (error) {
                  console.error("Error submitting ticket:", error);
                  alert("Error submitting ticket. Please try again.");
                } finally {
                  setSubmittingTicket(false);
                }
              }}
              disabled={submittingTicket}
              className="bg-yellow-500/90 text-black hover:bg-yellow-400 disabled:opacity-50"
            >
              {submittingTicket ? "Submitting..." : "Submit Ticket"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={scanFailedSiteId !== null} onOpenChange={(open) => !open && closeScanFailedDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Scan Failed</DialogTitle>
            <DialogDescription>
              The website security scan could not verify this upload.
            </DialogDescription>
          </DialogHeader>

          {selectedScanFailedSite && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                <p className="text-sm font-semibold text-foreground">{selectedScanFailedSite.name}</p>
                <p className="text-xs text-muted-foreground">{selectedScanFailedSite.original_filename}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                  <p className="font-medium text-destructive">Scan Failed</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Uploaded</p>
                  <p className="font-medium text-foreground">{new Date(selectedScanFailedSite.created_at).toLocaleDateString()}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Reason</p>
                  <p className="font-medium text-foreground">
                    {selectedScanFailedSite.error_message || "The website security could not be verified."}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
                <p>
                  Please contact <span className="font-semibold text-foreground">info@briehosting.be</span> because the security of the website could not be verified.
                </p>
                <p>
                  This upload should be reviewed before it is made available again.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={detailsSiteId !== null} onOpenChange={(open) => !open && setDetailsSiteId(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Site Details</DialogTitle>
            <DialogDescription>
              Deployment, hosting, and file information for this site.
            </DialogDescription>
          </DialogHeader>

          {selectedDetailsSite && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Site name</p>
                    <h3 className="mt-1 truncate text-xl font-semibold text-foreground">{selectedDetailsSite.name}</h3>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{selectedDetailsSite.original_filename}</p>
                  </div>
                  <span className={`w-fit text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${STATUS_STYLES[selectedDetailsSite.status]}`}>
                    {STATUS_LABEL[selectedDetailsSite.status]}
                  </span>
                </div>

                {selectedDetailsPublicUrl ? (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-yellow-400/30 bg-yellow-500/5 px-3 py-2">
                    <Globe className="h-4 w-4 shrink-0 text-yellow-300" />
                    <a
                      href={selectedDetailsPublicUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="min-w-0 flex-1 truncate text-sm font-medium text-yellow-200 hover:text-yellow-100"
                    >
                      {selectedDetailsPublicUrl}
                    </a>
                    <button
                      type="button"
                      onClick={() => void handleCopyUrl(selectedDetailsSite.id, selectedDetailsPublicUrl)}
                      className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-yellow-500/10 hover:text-yellow-200"
                      aria-label="Copy site URL"
                      title={copiedSiteId === selectedDetailsSite.id ? "Copied!" : "Copy URL"}
                    >
                      {copiedSiteId === selectedDetailsSite.id ? (
                        <Check className="h-4 w-4 text-emerald-300" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <a
                      href={selectedDetailsPublicUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-yellow-500/10 hover:text-yellow-200"
                      aria-label="Open site"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                ) : (
                  <p className="mt-4 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground">
                    Public URL is not available yet.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <h4 className="text-sm font-semibold text-foreground">Deployment timeline</h4>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
                  {deploymentSteps.map((step, index) => {
                    const isComplete = selectedDetailsStepIndex >= index || selectedDetailsSite.status === "live";
                    const isCurrent = selectedDetailsSite.status === step.status;
                    return (
                      <div
                        key={step.status}
                        className={`rounded-xl border p-3 ${
                          isCurrent
                            ? "border-yellow-400/50 bg-yellow-500/10"
                            : isComplete
                              ? "border-emerald-400/40 bg-emerald-500/10"
                              : "border-border bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              isCurrent
                                ? "bg-yellow-300"
                                : isComplete
                                  ? "bg-emerald-300"
                                  : "bg-muted-foreground/40"
                            }`}
                          />
                          <p className="text-xs font-medium text-foreground">{step.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {(selectedDetailsSite.status === "failed" || selectedDetailsSite.status === "scan_failed") && (
                  <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
                    <p className="font-medium text-destructive">
                      {selectedDetailsSite.status === "scan_failed" ? "Security scan failed" : "Deployment failed"}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {selectedDetailsSite.error_message || "No additional error details were provided."}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">File size</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{formatSiteSize(selectedDetailsSite.size_bytes)}</p>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Uploaded</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{new Date(selectedDetailsSite.created_at).toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Last updated</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{new Date(selectedDetailsSite.updated_at).toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">VM ID</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {selectedDetailsSite.vmid ?? selectedDetailsSite.proxmox_vmid ?? "Not assigned"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">IP address</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{selectedDetailsSite.ip_address || "Not assigned"}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDetailsSiteId(null)}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-yellow-400/70 hover:text-foreground"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDetailsSiteId(null);
                    handleDeleteSite(selectedDetailsSite.id);
                  }}
                  className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive transition hover:border-destructive/70 hover:bg-destructive/20"
                >
                  Remove Site
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={manageSiteId !== null} onOpenChange={(open) => !open && closeManageDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Site</DialogTitle>
            <DialogDescription>
              Update editable settings for this site.
            </DialogDescription>
          </DialogHeader>

          {selectedManageSite && (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSaveManage();
              }}
            >
              <div>
                <label htmlFor="manage-site-name" className="mb-1 block text-sm font-semibold text-foreground">
                  Site name
                </label>
                <input
                  id="manage-site-name"
                  type="text"
                  value={manageForm.name}
                  onChange={(event) => setManageForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/40"
                  placeholder="My awesome site"
                  disabled={manageSaving}
                />
              </div>

              <div>
                <label htmlFor="manage-site-domain" className="mb-1 block text-sm font-semibold text-foreground">
                  Domain
                </label>
                <div className="flex items-stretch overflow-hidden rounded-lg border border-border bg-background/60 focus-within:ring-2 focus-within:ring-yellow-500/40">
                  <input
                    id="manage-site-domain"
                    type="text"
                    value={manageForm.domain}
                    onChange={(event) => setManageForm((current) => ({ ...current, domain: event.target.value }))}
                    className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
                    placeholder="your-site"
                    disabled={manageSaving}
                  />
                  <span className="flex items-center border-l border-border bg-muted/30 px-3 text-xs text-muted-foreground">
                    .{PUBLIC_DOMAIN}
                  </span>
                </div>
              </div>

              {manageError && (
                <p className="text-sm text-destructive">{manageError}</p>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeManageDialog}
                  disabled={manageSaving}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-yellow-400/70 hover:text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manageSaving}
                  className="rounded-lg bg-yellow-500/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:opacity-50"
                >
                  {manageSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <SiteUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onUploaded={refetchSites} />
    </div>
  );
}
