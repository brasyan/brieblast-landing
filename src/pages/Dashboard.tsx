import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Globe, Database, HardDrive, Wifi, Plus, Settings, FileText, MessageSquare } from "lucide-react";

interface Website {
  domain: string;
  plan: string;
  status: "Live" | "Deploying" | "Offline";
  lastDeployed: string;
}

interface Activity {
  emoji: string;
  description: string;
  timestamp: string;
}

const websites: Website[] = [
  { domain: "myblog.be", plan: "Cheddar Pro", status: "Live", lastDeployed: "2026-03-04 22:14" },
  { domain: "shop.be", plan: "Gouda Max", status: "Live", lastDeployed: "2026-03-03 10:02" },
  { domain: "portfolio.dev", plan: "Cheddar Pro", status: "Deploying", lastDeployed: "2026-03-05 07:11" },
];

const activities: Activity[] = [
  { emoji: "🚀", description: "Deployed myblog.be — v2.4.1", timestamp: "2 min ago" },
  { emoji: "🔒", description: "SSL renewed for shop.be — valid until 2027", timestamp: "1 hr ago" },
  { emoji: "💾", description: "Backup completed for all 3 websites", timestamp: "6 hr ago" },
  { emoji: "📧", description: "Email alias created: hello@myblog.be", timestamp: "Yesterday" },
  { emoji: "⚡", description: "CDN cache purged for shop.be", timestamp: "2 days ago" },
];

const statusConfig: Record<Website["status"], { classes: string }> = {
  Live: { classes: "bg-accent/20 text-accent border border-accent/30" },
  Deploying: { classes: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
  Offline: { classes: "bg-destructive/20 text-destructive border border-destructive/30" },
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Dashboard Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="font-bold text-xl hover:opacity-80 transition-opacity">
            <span className="text-gradient-cheese">Brie</span>
            <span className="text-foreground">Hosting</span>
          </a>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:border-primary hover:text-primary transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Welcome Banner */}
          <div className="mb-10 rounded-2xl border border-border bg-card p-8 glow-cheese flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-meme text-muted-foreground mb-1">Welcome back 👋</p>
              <h1 className="text-3xl md:text-4xl font-bold">
                {user?.name ?? "Cheese Enjoyer"} <span className="text-gradient-cheese">🧀</span>
              </h1>
              <p className="text-muted-foreground font-meme mt-2 text-sm">
                Your websites are looking gouda. Here's what's happening today.
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground font-meme">Account since</p>
              <p className="font-bold text-foreground">{user?.memberSince ?? "January 2025"}</p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="rounded-xl border border-border bg-card p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground font-meme">Websites Hosted</span>
              </div>
              <p className="text-4xl font-bold text-foreground">3</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-muted">
                  <HardDrive className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground font-meme">Storage Used</span>
              </div>
              <p className="text-4xl font-bold text-foreground">12.4 <span className="text-xl text-muted-foreground">GB</span></p>
              <div className="mt-2 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "24.8%" }} />
              </div>
              <p className="text-xs text-muted-foreground font-meme mt-1">of 50 GB</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Wifi className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground font-meme">Bandwidth This Month</span>
              </div>
              <p className="text-4xl font-bold text-foreground">48.2 <span className="text-xl text-muted-foreground">GB</span></p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground font-meme">Active Databases</span>
              </div>
              <p className="text-4xl font-bold text-foreground">2</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* My Websites Table */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-bold text-foreground text-lg">My Websites</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40">
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground">Domain</th>
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground">Plan</th>
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground">Last Deployed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {websites.map((site, i) => (
                      <tr key={i} className="border-t border-border hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{site.domain}</td>
                        <td className="px-6 py-4 text-muted-foreground font-meme">{site.plan}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${statusConfig[site.status].classes}`}>
                            {site.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground font-meme text-xs">{site.lastDeployed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-bold text-foreground text-lg">Recent Activity</h2>
              </div>
              <ul className="divide-y divide-border">
                {activities.map((item, i) => (
                  <li key={i} className="px-6 py-4 flex items-start gap-3 hover:bg-muted/20 transition-colors">
                    <span className="text-lg shrink-0">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{item.description}</p>
                      <p className="text-xs text-muted-foreground font-meme mt-1">{item.timestamp}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-bold text-foreground text-lg mb-5">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary hover:bg-muted/30 transition-all text-center group">
                <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Add Website</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary hover:bg-muted/30 transition-all text-center group">
                <Settings className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Manage DNS</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary hover:bg-muted/30 transition-all text-center group">
                <FileText className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">View Invoices</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary hover:bg-muted/30 transition-all text-center group">
                <MessageSquare className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Open Support Ticket</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
