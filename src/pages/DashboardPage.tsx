import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useSites, type SiteStatus } from "@/hooks/useSites";
import { PLANS, type PlanId } from "@/lib/plans";
import { Check, Upload } from "lucide-react";
import { useState } from "react";
import SiteUploadDialog from "@/components/SiteUploadDialog";

const STATUS_STYLES: Record<SiteStatus, string> = {
  uploaded: "bg-muted text-muted-foreground",
  provisioning: "bg-primary/20 text-primary",
  live: "bg-accent/20 text-accent",
  failed: "bg-destructive/20 text-destructive",
};

const STATUS_LABEL: Record<SiteStatus, string> = {
  uploaded: "Uploaded",
  provisioning: "Provisioning…",
  live: "Live",
  failed: "Failed",
};

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, updatePlan } = useProfile();
  const { sites, loading: sitesLoading, error: sitesError, refetch: refetchSites } = useSites();
  const navigate = useNavigate();
  const [changingPlan, setChangingPlan] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSelectPlan = async (planId: PlanId) => {
    setChangingPlan(true);
    await updatePlan(planId);
    setChangingPlan(false);
  };

  const currentPlan = profile?.plan && profile.plan !== "none" ? PLANS[profile.plan as Exclude<PlanId, "none">] : null;

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
              <p className="text-xs text-destructive/80 mt-1 break-words">
                {sitesError}
              </p>
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
    <div className="min-h-screen bg-background">
      {/* Dashboard Nav */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-xl">
            <span className="text-gradient-cheese">Brie</span>
            <span className="text-foreground">Hosting</span>
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Link
              to="/account-settings"
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            >
              Account settings
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back! 🧀
        </h1>
        <p className="text-muted-foreground mb-8">
          Your cheesy dashboard awaits. This is where the magic happens.
        </p>

        {/* Current Plan Card */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Plan</h2>
          {profileLoading ? (
            <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
              <div className="h-6 w-32 bg-muted rounded" />
            </div>
          ) : currentPlan ? (
            <div className={`bg-card border-2 ${currentPlan.popular ? "border-primary glow-cheese" : "border-border"} rounded-xl p-6`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{currentPlan.meme}</span>
                    <h3 className="text-xl font-bold text-foreground">{currentPlan.name}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm font-meme">{currentPlan.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-gradient-cheese">{currentPlan.price}</span>
                  <span className="text-muted-foreground">{currentPlan.period}</span>
                </div>
              </div>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentPlan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-muted-foreground text-sm">No plan selected yet. Choose one below!</p>
            </div>
          )}
        </div>

        {/* Plan Selection */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {currentPlan ? "Change Plan" : "Choose a Plan"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.entries(PLANS) as [Exclude<PlanId, "none">, typeof PLANS[keyof typeof PLANS]][]).map(([planId, plan]) => {
              const isActive = profile?.plan === planId;
              return (
                <div
                  key={planId}
                  className={`relative rounded-xl border-2 ${isActive ? "border-primary glow-cheese" : plan.popular ? "border-primary/50" : "border-border"} bg-card p-6 flex flex-col card-hover`}
                >
                  {isActive && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                      CURRENT
                    </div>
                  )}
                  {!isActive && plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      POPULAR 🔥
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <div className="text-2xl mb-1">{plan.meme}</div>
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  </div>
                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold text-gradient-cheese">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-foreground">
                        <Check className="w-3 h-3 text-accent shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSelectPlan(planId)}
                    disabled={isActive || changingPlan}
                    className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : plan.popular
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {isActive ? "Current Plan ✓" : changingPlan ? "Updating..." : `Select ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Your Sites */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Your Sites</h2>
            <button
              onClick={() => setUploadOpen(true)}
              disabled={!currentPlan}
              title={!currentPlan ? "Pick a plan first" : undefined}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              <Upload className="w-4 h-4" />
              Upload site
            </button>
          </div>

          {sitesLoading ? (
            <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
              <div className="h-5 w-40 bg-muted rounded" />
            </div>
          ) : sites.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-muted-foreground text-sm">
                No sites yet — upload your first .zip to get cookin'. 🧀
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl divide-y divide-border">
              {sites.map((site) => (
                <div key={site.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-bold text-foreground truncate">{site.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {site.original_filename} · {(site.size_bytes / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[site.status]}`}>
                    {STATUS_LABEL[site.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-6 card-hover">
            <div className="text-3xl mb-3">🖥️</div>
            <h2 className="font-bold text-foreground mb-1">Your Services</h2>
            <p className="text-sm text-muted-foreground">No active services yet. Pick a plan to get started!</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 card-hover">
            <div className="text-3xl mb-3">📊</div>
            <h2 className="font-bold text-foreground mb-1">Usage</h2>
            <p className="text-sm text-muted-foreground">Your resource usage will appear here.</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 card-hover">
            <div className="text-3xl mb-3">🎫</div>
            <h2 className="font-bold text-foreground mb-1">Support</h2>
            <p className="text-sm text-muted-foreground">Need help? Open a support ticket anytime.</p>
          </div>
        </div>
      </main>

      <SiteUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={refetchSites}
      />
    </div>
  );
}
