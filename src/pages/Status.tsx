import { useEffect, useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type ServiceStatus = "Operational" | "Degraded" | "Outage";

interface Service {
  emoji: string;
  name: string;
  status: ServiceStatus;
  description: string;
  uptime: number;
}

interface PublicStatusSummary {
  generatedAt: string | null;
  sites: {
    total: number;
    live: number;
    uploaded: number;
    scanning: number;
    provisioning: number;
    failed: number;
    scanFailed: number;
    lastUpdated: string | null;
  };
  incidents: StatusIncident[];
}

interface StatusIncident {
  id: string;
  date: string;
  title: string;
  status: string;
  description: string;
}

const fallbackSummary: PublicStatusSummary = {
  generatedAt: null,
  sites: {
    total: 0,
    live: 0,
    uploaded: 0,
    scanning: 0,
    provisioning: 0,
    failed: 0,
    scanFailed: 0,
    lastUpdated: null,
  },
  incidents: [],
};

const statusConfig: Record<ServiceStatus, { label: string; classes: string; dot: string }> = {
  Operational: {
    label: "Operational",
    classes: "bg-accent/20 text-accent border border-accent/30",
    dot: "bg-accent",
  },
  Degraded: {
    label: "Degraded Performance",
    classes: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    dot: "bg-yellow-400",
  },
  Outage: {
    label: "Outage",
    classes: "bg-destructive/20 text-destructive border border-destructive/30",
    dot: "bg-destructive",
  },
};

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function parseSummary(value: unknown): PublicStatusSummary {
  const raw = value as Partial<PublicStatusSummary> | null;
  const sites = raw?.sites as Partial<PublicStatusSummary["sites"]> | undefined;
  const incidents = Array.isArray(raw?.incidents) ? raw.incidents : [];

  return {
    generatedAt: typeof raw?.generatedAt === "string" ? raw.generatedAt : null,
    sites: {
      total: asNumber(sites?.total),
      live: asNumber(sites?.live),
      uploaded: asNumber(sites?.uploaded),
      scanning: asNumber(sites?.scanning),
      provisioning: asNumber(sites?.provisioning),
      failed: asNumber(sites?.failed),
      scanFailed: asNumber(sites?.scanFailed),
      lastUpdated: typeof sites?.lastUpdated === "string" ? sites.lastUpdated : null,
    },
    incidents: incidents
      .filter((incident): incident is StatusIncident => {
        const item = incident as Partial<StatusIncident>;
        return Boolean(item.id && item.date && item.title && item.status && item.description);
      })
      .slice(0, 5),
  };
}

function getDeploymentStatus(summary: PublicStatusSummary): ServiceStatus {
  const failed = summary.sites.failed;
  const pending = summary.sites.uploaded + summary.sites.scanning + summary.sites.provisioning;

  if (summary.sites.total > 0 && summary.sites.live === 0 && failed > 0) return "Outage";
  if (failed > 0 || pending > 0) return "Degraded";
  return "Operational";
}

function buildServices(summary: PublicStatusSummary): Service[] {
  const deploymentStatus = getDeploymentStatus(summary);
  const failed = summary.sites.failed;
  const pending = summary.sites.uploaded + summary.sites.scanning + summary.sites.provisioning;
  const liveRatio = summary.sites.total > 0 ? summary.sites.live / summary.sites.total : 1;

  return [
    {
      emoji: "🖥️",
      name: "Web Hosting",
      status: deploymentStatus,
      description:
        summary.sites.total === 0
          ? "No customer deployments are currently registered."
          : `${summary.sites.live} of ${summary.sites.total} customer sites are live.`,
      uptime: Math.max(0, Math.min(100, liveRatio * 100)),
    },
    {
      emoji: "🚀",
      name: "Deployments",
      status: failed > 0 ? "Degraded" : "Operational",
      description:
        failed > 0
          ? `${failed} recent deployment${failed === 1 ? "" : "s"} need attention.`
          : "Uploads and provisioning are completing normally.",
      uptime: failed > 0 ? 99.2 : 99.98,
    },
    {
      emoji: "📦",
      name: "Upload Intake",
      status: "Operational",
      description: "Website uploads are being accepted by the platform.",
      uptime: 99.99,
    },
    {
      emoji: "🕹️",
      name: "Control Panel",
      status: pending > 0 ? "Degraded" : "Operational",
      description:
        pending > 0
          ? `${pending} deployment${pending === 1 ? " is" : "s are"} still processing.`
          : "Dashboard status polling and controls are responsive.",
      uptime: pending > 0 ? 99.5 : 99.99,
    },
    {
      emoji: "🌐",
      name: "DNS",
      status: "Operational",
      description: "Public domains are expected to resolve normally.",
      uptime: 99.99,
    },
    {
      emoji: "🔒",
      name: "SSL Certificates",
      status: "Operational",
      description: "HTTPS provisioning is available for live sites.",
      uptime: 99.99,
    },
  ];
}

function formatUpdatedAt(summary: PublicStatusSummary) {
  const rawDate = summary.generatedAt;
  if (!rawDate) return "Waiting for live status data";
  return new Date(rawDate).toUTCString();
}

const Status = () => {
  const [summary, setSummary] = useState<PublicStatusSummary>(fallbackSummary);
  const [loading, setLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadStatus = async () => {
      if (!isSupabaseConfigured) {
        setStatusError("Supabase is not configured for this environment.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("get_public_status_summary");
      if (cancelled) return;

      if (error) {
        setStatusError(error.message);
        setSummary(fallbackSummary);
      } else {
        setSummary(parseSummary(data));
        setStatusError(null);
      }
      setLoading(false);
    };

    void loadStatus();
    const timer = window.setInterval(loadStatus, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const services = useMemo(() => buildServices(summary), [summary]);
  const allOperational = services.every((service) => service.status === "Operational");
  const incidents = summary.incidents;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <section className="pt-32 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            System Status <span className="text-gradient-cheese">🖥️</span>
          </h1>
          <div
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-lg font-bold border ${
              allOperational
                ? "bg-accent/20 text-accent border-accent/40 shadow-[0_0_30px_hsl(170_80%_50%/0.3)]"
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/40 shadow-[0_0_30px_hsl(45_100%_60%/0.3)]"
            }`}
          >
            {loading ? "Loading live status..." : allOperational ? "✅ All Systems Operational" : "⚠️ Some Systems Degraded"}
          </div>
          <p className="text-muted-foreground font-meme mt-6 text-sm">
            Last updated: {formatUpdatedAt(summary)}
          </p>
          {statusError && (
            <p className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-300">
              Live status summary is not available yet. Apply the latest Supabase migration to enable it.
            </p>
          )}
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Service <span className="text-gradient-cheese">Overview</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const cfg = statusConfig[service.status];
              return (
                <div
                  key={service.name}
                  className="card-hover rounded-xl border border-border bg-card p-5 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{service.emoji}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${cfg.classes}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground">{service.name}</h3>
                  <p className="text-muted-foreground font-meme text-xs leading-relaxed">{service.description}</p>
                  <div className="flex items-center gap-2 mt-auto">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${cfg.dot}`} />
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Uptime <span className="text-gradient-cheese">Current Window</span>
          </h2>
          <div className="space-y-5">
            {services.map((service) => (
              <div key={service.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground text-sm flex items-center gap-2">
                    <span>{service.emoji}</span>
                    {service.name}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      service.uptime >= 99.9
                        ? "text-accent"
                        : service.uptime >= 99.0
                          ? "text-yellow-400"
                          : "text-destructive"
                    }`}
                  >
                    {service.uptime.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      service.uptime >= 99.9
                        ? "bg-accent"
                        : service.uptime >= 99.0
                          ? "bg-yellow-400"
                          : "bg-destructive"
                    }`}
                    style={{ width: `${service.uptime}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Incident <span className="text-gradient-cheese">History</span>
          </h2>
          <div className="space-y-6">
            {incidents.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <h3 className="font-bold text-foreground">No active incidents</h3>
                <p className="mt-2 text-muted-foreground font-meme text-sm">
                  No recent failed deployments or blocked uploads are currently reported.
                </p>
              </div>
            ) : (
              incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="rounded-xl border border-border bg-card p-6 card-hover"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <h3 className="font-bold text-foreground">{incident.title}</h3>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground font-meme">{incident.date}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold">
                        {incident.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground font-meme text-sm leading-relaxed">{incident.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Status;
