import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

type ServiceStatus = "Operational" | "Degraded" | "Outage";

interface Service {
  emoji: string;
  name: string;
  status: ServiceStatus;
  description: string;
  uptime: number;
}

const services: Service[] = [
  {
    emoji: "🖥️",
    name: "Web Hosting",
    status: "Operational",
    description: "All servers humming like a satisfied cheese connoisseur.",
    uptime: 99.98,
  },
  {
    emoji: "🌐",
    name: "DNS",
    status: "Operational",
    description: "Resolving domains faster than you can say 'Brie de Meaux'.",
    uptime: 99.99,
  },
  {
    emoji: "🔒",
    name: "SSL Certificates",
    status: "Operational",
    description: "Your HTTPS is safe, sound, and fully fermented.",
    uptime: 100.0,
  },
  {
    emoji: "🗄️",
    name: "Database Clusters",
    status: "Operational",
    description: "Queries return in milliseconds. Faster than our intern makes coffee.",
    uptime: 99.95,
  },
  {
    emoji: "🌍",
    name: "CDN",
    status: "Operational",
    description: "Content delivered globally, aged to perfection at every edge node.",
    uptime: 99.97,
  },
  {
    emoji: "📧",
    name: "Email Delivery",
    status: "Degraded",
    description: "Slightly clogged. Like camembert on a warm day. We're on it.",
    uptime: 98.41,
  },
  {
    emoji: "🎫",
    name: "Support Portal",
    status: "Operational",
    description: "Tickets flowing in, replies flying out. The cheese wheel turns.",
    uptime: 99.92,
  },
  {
    emoji: "🕹️",
    name: "Control Panel",
    status: "Operational",
    description: "Dashboards loading, buttons clicking, admins rejoicing.",
    uptime: 99.89,
  },
];

const incidents = [
  {
    date: "2026-02-14",
    title: "Valentine's Day CDN Hiccup 💝",
    status: "Resolved",
    description:
      "CDN edge node in Brussels went down for 12 minutes after an intern accidentally spilled fondue on the server rack. Cleaned up, rebooted, reprimanded (lovingly). All traffic restored by 19:12 CET.",
  },
  {
    date: "2026-01-08",
    title: "Database Cluster Mild Existential Crisis 🧀",
    status: "Resolved",
    description:
      "Cluster 3 briefly questioned its purpose in life during a routine maintenance window. A firm pep talk and a config rollback brought it back to 100%. No data was lost, only dignity.",
  },
  {
    date: "2025-12-31",
    title: "New Year's Eve Traffic Spike 🎆",
    status: "Resolved",
    description:
      "Unexpected 400% traffic surge as everyone visited cheese-related websites at midnight. Auto-scaling kicked in 47 seconds late. We added more cheese servers. Won't happen again. (We say this every year.)",
  },
];

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

const allOperational = services.every((s) => s.status === "Operational");

const Status = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
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
            {allOperational ? "✅ All Systems Operational" : "⚠️ Some Systems Degraded"}
          </div>
          <p className="text-muted-foreground font-meme mt-6 text-sm">
            Last updated: {new Date().toUTCString()} · No cheese was harmed in the making of this page.
          </p>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Service <span className="text-gradient-cheese">Overview</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Uptime Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Uptime <span className="text-gradient-cheese">Last 90 Days</span>
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

      {/* Incident History */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Incident <span className="text-gradient-cheese">History</span>
          </h2>
          <div className="space-y-6">
            {incidents.map((incident, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-6 card-hover"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h3 className="font-bold text-foreground">{incident.title}</h3>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground font-meme">{incident.date}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent border border-accent/30 font-bold">
                      {incident.status}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground font-meme text-sm leading-relaxed">{incident.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Status;
