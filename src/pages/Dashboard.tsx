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
  Upload,
  Users,
  Wifi,
} from "lucide-react";
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
import SiteUploadDialog from "@/components/SiteUploadDialog";

interface Project {
  name: string;
  domain: string;
  status: "Live" | "Deploying" | "Offline";
  lastDeploy: string;
  storage: string;
}

interface UploadItem {
  name: string;
  size: string;
  status: "Processing" | "Complete";
  time: string;
}

interface ActivityItem {
  title: string;
  description: string;
  time: string;
}

const projects: Project[] = [];

const uploads: UploadItem[] = [];

const activities: ActivityItem[] = [];

const statusConfig: Record<Project["status"], { label: string; classes: string }> = {
  Live: { label: "Live", classes: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" },
  Deploying: { label: "Deploying", classes: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" },
  Offline: { label: "Offline", classes: "bg-destructive/20 text-destructive border border-destructive/30" },
};

const plans = [
  {
    id: "smol",
    name: "Smol Brie",
    price: "$19",
    perks: ["5 projects", "25 GB storage", "Basic analytics"],
    highlight: false,
  },
  {
    id: "thicc",
    name: "Thicc Brie",
    price: "$39",
    perks: ["20 projects", "50 GB storage", "Team access"],
    highlight: true,
  },
  {
    id: "mega",
    name: "Mega Brie",
    price: "$79",
    perks: ["Unlimited projects", "200 GB storage", "Priority support"],
    highlight: false,
  },
];

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [currentPlanId, setCurrentPlanId] = useState("thicc");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const currentPlan = plans.find((plan) => plan.id === currentPlanId) ?? plans[1];
  const pendingPlan = plans.find((plan) => plan.id === pendingPlanId) ?? null;

  const handleSelectPlan = (planId: string) => {
    if (planId === currentPlanId) {
      return;
    }

    if (!plans.find((plan) => plan.id === planId)) {
      return;
    }

    setPendingPlanId(planId);
    setConfirmOpen(true);
  };

  const handleConfirmPlan = () => {
    if (pendingPlanId) {
      setCurrentPlanId(pendingPlanId);
    }
    setConfirmOpen(false);
    setPendingPlanId(null);
  };

  const handleCancelPlan = () => {
    setConfirmOpen(false);
    setPendingPlanId(null);
  };

  const handleUploadComplete = () => {};

  useEffect(() => {
    const sectionIds = ["overview", "projects", "upload", "plan", "analytics", "billing", "support", "settings", "activity"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) {
      return undefined;
    }

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

  return (
    <div className="relative min-h-screen bg-background text-foreground scroll-smooth">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-yellow-500/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <div className="relative flex">
        <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col border-r border-border bg-card/40 backdrop-blur-sm sticky top-0 h-screen">
          <div className="px-6 py-6 border-b border-border">
            <a href="/" className="font-bold text-2xl tracking-tight hover:opacity-90 transition-opacity">
              <span className="text-gradient-cheese">Brie</span>
              <span className="text-foreground">Hosting</span>
            </a>
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
              My Projects
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
              href="#projects"
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
                activeSection === "projects"
                  ? "bg-muted/40 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Database className="h-4 w-4 text-yellow-400" />
              Domains
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
              href="#settings"
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
                activeSection === "settings"
                  ? "bg-muted/40 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Settings2 className="h-4 w-4 text-yellow-400" />
              Settings
            </a>
          </nav>
          <div className="px-6 pb-6">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground font-meme">Everything is running smoothly</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Uptime</span>
                <span className="text-sm text-yellow-300 font-semibold">99.98%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full w-[95%] rounded-full bg-gradient-to-r from-yellow-400 to-amber-300" />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
            <div className="flex flex-col gap-4 px-4 py-4 lg:px-8 lg:py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-muted/50 p-2 text-yellow-300">🧀</div>
                  <div>
                    <p className="text-xs text-muted-foreground font-meme">Your dashboard is ready</p>
                    <p className="text-lg font-semibold text-foreground">Welcome back, CheeseEnjoyer</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="#billing"
                    className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-yellow-400/70 transition"
                  >
                    <CreditCard className="h-4 w-4" />
                    Billing
                  </a>
                  <a
                    href="/account-settings"
                    className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-yellow-400/70 transition"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </a>
                  <a
                    href="#activity"
                    className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground hover:border-yellow-400/70 transition"
                    aria-label="Recent activity"
                  >
                    <Bell className="h-4 w-4" />
                  </a>
                  <a
                    href="/account-settings"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-foreground hover:border-yellow-400/70 transition"
                  >
                    <span className="h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs">CE</span>
                    CheeseEnjoyer
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="w-full rounded-xl border border-border bg-card/70 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/40"
                    placeholder="Search projects, domains, invoices"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-yellow-500/90 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400 transition"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Project
                  </button>
                  <a
                    href="#plan"
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-yellow-400/70 transition"
                  >
                    <Rocket className="h-4 w-4" />
                    Upgrade Plan
                  </a>
                  <a
                    href="#billing"
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-yellow-400/70 transition"
                  >
                    <CreditCard className="h-4 w-4" />
                    View Billing
                  </a>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 pb-16 pt-8 lg:px-8">
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
                      <p className="mt-2 text-2xl font-semibold">{projects.length}</p>
                      <p className="text-xs text-muted-foreground">Live data pending</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/60 p-4">
                      <p className="text-xs text-muted-foreground">Current plan</p>
                      <p className="mt-2 text-2xl font-semibold">Thicc Brie</p>
                      <p className="text-xs text-yellow-300">Renews May 28</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/60 p-4">
                      <p className="text-xs text-muted-foreground">Monthly visitors</p>
                      <p className="mt-2 text-2xl font-semibold">—</p>
                      <p className="text-xs text-muted-foreground">Connect analytics</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="stats" className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 scroll-mt-28">
              {[
                { label: "Active Sites", value: projects.length.toString(), icon: Globe },
                { label: "Current Plan", value: currentPlan.name, icon: ShieldCheck },
                { label: "Storage Used", value: "—", icon: HardDrive },
                { label: "Uptime", value: "—", icon: Wifi },
                { label: "Monthly Visitors", value: "—", icon: Users },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
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

            <section id="projects" className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] scroll-mt-28">
              <div id="upload" className="rounded-3xl border border-border bg-card/70 p-6 scroll-mt-28">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Projects</h2>
                  <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-yellow-400/70 transition">
                    <Plus className="h-4 w-4" />
                    New Project
                  </button>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {projects.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-background/60 p-6 text-sm text-muted-foreground">
                      No projects yet. Upload your first site to get started.
                    </div>
                  ) : (
                    projects.map((project) => (
                      <div key={project.domain} className="rounded-2xl border border-border bg-background/60 p-5 transition hover:border-yellow-400/50 hover:shadow-lg hover:shadow-black/15">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-muted-foreground">{project.domain}</p>
                            <h3 className="mt-1 text-lg font-semibold text-foreground">{project.name}</h3>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusConfig[project.status].classes}`}>
                            {statusConfig[project.status].label}
                          </span>
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground">
                          <p>Last deploy: {project.lastDeploy}</p>
                          <p>Storage used: {project.storage}</p>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                          {[
                            { label: "Open", style: "bg-yellow-500/10 text-yellow-200 border-yellow-400/40" },
                            { label: "Manage", style: "bg-muted/40 text-muted-foreground border-border" },
                            { label: "Restart", style: "bg-muted/40 text-muted-foreground border-border" },
                            { label: "Delete", style: "bg-destructive/10 text-destructive border-destructive/30" },
                          ].map((action) => (
                            <button
                              key={action.label}
                              className={`rounded-full border px-3 py-1.5 transition hover:text-foreground ${action.style}`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

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
                  <p className="text-sm font-semibold">Drop your .zip project here</p>
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
                <div className="mt-5 space-y-3">
                  {uploads.length === 0 ? (
                    <div className="rounded-xl border border-border bg-background/60 p-4 text-xs text-muted-foreground">
                      No uploads yet. Use the upload button to add your first project.
                    </div>
                  ) : (
                    uploads.map((upload) => (
                      <div key={upload.name} className="rounded-xl border border-border bg-background/60 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{upload.name}</p>
                          <span className={`text-xs ${upload.status === "Complete" ? "text-emerald-300" : "text-yellow-300"}`}>
                            {upload.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{upload.size} · {upload.time}</p>
                        <div className="mt-2 h-2 rounded-full bg-muted/60 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-300"
                            style={{ width: upload.status === "Complete" ? "100%" : "68%" }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section id="plan" className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1.8fr] scroll-mt-28">
              <div className="rounded-3xl border border-border bg-card/70 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Current Plan</h2>
                  <button className="text-xs text-yellow-300 hover:text-yellow-200 transition">Manage plan</button>
                </div>
                <div className="mt-5 rounded-2xl border border-border bg-background/60 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active plan</p>
                      <p className="text-2xl font-semibold">{currentPlan.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{currentPlan.price} / month</p>
                      <p className="text-xs text-yellow-300">Renews May 28, 2026</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3 text-xs text-muted-foreground">
                    <div>
                      <div className="flex items-center justify-between">
                        <span>Storage</span>
                        <span className="text-foreground">12.4 GB / 50 GB</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-muted/60 overflow-hidden">
                        <div className="h-full w-[25%] rounded-full bg-gradient-to-r from-yellow-400 to-amber-300" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span>Bandwidth</span>
                        <span className="text-foreground">48.2 GB / 200 GB</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-muted/60 overflow-hidden">
                        <div className="h-full w-[30%] rounded-full bg-gradient-to-r from-yellow-400 to-amber-300" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span>Projects</span>
                        <span className="text-foreground">8 / 20</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-muted/60 overflow-hidden">
                        <div className="h-full w-[40%] rounded-full bg-gradient-to-r from-yellow-400 to-amber-300" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                    Everything is running smoothly. Need more room? Upgrade to Mega Brie.
                  </div>
                </div>
              </div>

              <div id="billing" className="rounded-3xl border border-border bg-card/70 p-6 scroll-mt-28">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Upgrade Plans</h2>
                  <span className="text-xs text-muted-foreground">Brie-style pricing</span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${
                        plan.highlight
                          ? "border-yellow-400/70 bg-yellow-500/10"
                          : "border-border bg-background/60"
                      }`}
                    >
                      <p className="text-sm text-muted-foreground">{plan.name}</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {plan.price}
                        <span className="text-xs text-muted-foreground">/mo</span>
                      </p>
                      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {plan.perks.map((perk) => (
                          <li key={perk}>{perk}</li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleSelectPlan(plan.id)}
                        className={`mt-4 w-full rounded-lg px-3 py-2 text-xs font-semibold transition ${
                          currentPlanId === plan.id
                            ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
                            : plan.highlight
                              ? "bg-yellow-500/90 text-black hover:bg-yellow-400"
                              : "border border-border text-muted-foreground hover:text-foreground hover:border-yellow-400/70"
                        }`}
                      >
                        {currentPlanId === plan.id ? "Current plan" : plan.highlight ? "Recommended" : "Choose plan"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="analytics" className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr] scroll-mt-28">
              <div id="activity" className="rounded-3xl border border-border bg-card/70 p-6 scroll-mt-28">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Analytics</h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <LineChart className="h-4 w-4" />
                    Last 30 days
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Visitors</p>
                      <span className="text-xs text-muted-foreground">No data</span>
                    </div>
                    <p className="mt-3 text-2xl font-semibold">—</p>
                    <div className="mt-4 flex items-center justify-center h-24 rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                      Connect analytics to see trends
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Deploy history</p>
                      <span className="text-xs text-muted-foreground">No deploys</span>
                    </div>
                    <div className="mt-5 space-y-3 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Waiting for first deploy</span>
                        <span className="text-muted-foreground">—</span>
                      </div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-muted/60 overflow-hidden">
                      <div className="h-full w-[5%] rounded-full bg-gradient-to-r from-yellow-400 to-amber-300" />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-sm text-muted-foreground">CPU usage</p>
                    <p className="mt-3 text-2xl font-semibold">—</p>
                    <div className="mt-3 h-2 rounded-full bg-muted/60 overflow-hidden">
                      <div className="h-full w-[0%] rounded-full bg-gradient-to-r from-yellow-400 to-amber-300" />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Connect monitoring to see usage.</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-sm text-muted-foreground">RAM usage</p>
                    <p className="mt-3 text-2xl font-semibold">—</p>
                    <div className="mt-3 h-2 rounded-full bg-muted/60 overflow-hidden">
                      <div className="h-full w-[0%] rounded-full bg-gradient-to-r from-yellow-400 to-amber-300" />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Monitoring data not connected.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card/70 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Recent Activity</h2>
                  <button className="text-xs text-muted-foreground hover:text-foreground transition">View all</button>
                </div>
                <div className="mt-5 space-y-4">
                  {activities.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-background/60 p-4 text-xs text-muted-foreground">
                      No activity yet. Your deployments and changes will appear here.
                    </div>
                  ) : (
                    activities.map((item) => (
                      <div key={item.title} className="rounded-2xl border border-border bg-background/60 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section id="support" className="grid grid-cols-1 gap-6 lg:grid-cols-3 scroll-mt-28">
              <div className="rounded-3xl border border-border bg-card/70 p-6 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Support</h2>
                  <span className="text-xs text-muted-foreground">We are here for you</span>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {
                    [
                      { label: "Open Ticket", icon: MessageSquare, note: "Average response 2h" },
                      { label: "Live Chat", icon: Activity, note: "Instant help" },
                      { label: "Docs", icon: FileText, note: "Guides & API" },
                    ]
                  .map((item) => (
                    <button
                      key={item.label}
                      className="rounded-2xl border border-border bg-background/60 p-4 text-left transition hover:border-yellow-400/70 hover:shadow-lg hover:shadow-black/10"
                    >
                      <item.icon className="h-5 w-5 text-yellow-300" />
                      <p className="mt-3 text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div id="settings" className="rounded-3xl border border-border bg-card/70 p-6 scroll-mt-28">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Quick Actions</h2>
                  <span className="text-xs text-muted-foreground">Deploy fresh updates</span>
                </div>
                <div className="mt-4 space-y-3">
                  {["Add domain", "Invite teammate", "Generate API key"].map((item) => (
                    <button
                      key={item}
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground transition hover:text-foreground hover:border-yellow-400/70"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="border border-border bg-card/95 shadow-2xl shadow-black/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-foreground">
              Switch to {pendingPlan?.name ?? "this plan"}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              You are about to move to {pendingPlan?.name ?? "the selected plan"} for {pendingPlan?.price ?? ""}/mo.
              Your plan updates instantly and keeps all active projects online.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">What you get</p>
            <ul className="mt-2 space-y-1">
              {(pendingPlan?.perks ?? []).map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelPlan}
              className="border-border bg-transparent text-muted-foreground hover:text-foreground"
            >
              Keep current plan
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPlan}
              className="bg-yellow-500/90 text-black hover:bg-yellow-400"
            >
              Confirm switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SiteUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onUploaded={handleUploadComplete} />
    </div>
  );
};

export default Dashboard;
