import { CheckCircle2, Sparkles, Shield, CreditCard, LayoutDashboard, Upload, Server, Eye, Lock, Wrench } from "lucide-react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const milestones = [
  {
    icon: Upload,
    title: "Site Upload & Import",
    description: "Upload your site via zip file or import directly from GitHub, GitLab, and git.gay repositories. Pick your subdomain before provisioning.",
    status: "done",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Overhaul",
    description: "Redesigned dashboard with auto-refresh while uploads are in flight, copy/open buttons for site URLs, and a manage modal for site settings.",
    status: "done",
  },
  {
    icon: Shield,
    title: "Briescan Security Scanner",
    description: "Automated vulnerability scanning for all hosted sites. Detect malware, CVEs, and bad actors. Get alerted on failures and track scan status in real time.",
    status: "done",
  },
  {
    icon: CreditCard,
    title: "Payment System",
    description: "Full Stripe payment flow with payment return handling, crypto payment option via Coinbase, Bancontact support, and payment history in the dashboard billing section.",
    status: "done",
  },
  {
    icon: Lock,
    title: "Multi-Factor Auth",
    description: "MFA enrollment for new accounts with opt-in for existing users. Setup and verification pages with encouragement dialogs.",
    status: "done",
  },
  {
    icon: Server,
    title: "Infrastructure & Provisioning",
    description: "Automated LXC container provisioning from uploads, per-plan site limits enforced, real-time Supabase subscriptions for site status updates.",
    status: "done",
  },
  {
    icon: Eye,
    title: "Status Monitoring",
    description: "Live status page with service details, uptime tracking, and incident history.",
    status: "done",
  },
  {
    icon: Wrench,
    title: "Admin Dashboard",
    description: "Admin panel with security alerts, site management, and system oversight.",
    status: "done",
  },
  {
    icon: Sparkles,
    title: "One-Click Redeploy",
    description: "Re-deploy git-sourced sites with a single click. Pull latest changes from your repository without re-uploading.",
    status: "done",
  },
];

const upcoming = [
  {
    title: "Custom Domain Binding",
    description: "Point your own domain to your BrieHosting site with one-click DNS configuration.",
    eta: "Q3 2026",
  },
  {
    title: "Team Collaboration",
    description: "Invite team members to manage sites with role-based access control.",
    eta: "Q3 2026",
  },
  {
    title: "Analytics Dashboard",
    description: "Built-in traffic analytics, bandwidth monitoring, and visitor insights.",
    eta: "Q4 2026",
  },
  {
    title: "API Access",
    description: "Public API for programmatic site management, deployments, and monitoring.",
    eta: "Q4 2026",
  },
  {
    title: "One-Click Backups & Restore",
    description: "Manual and scheduled backups with instant restore from any point in time.",
    eta: "Q4 2026",
  },
  {
    title: "Belgian Waffle Integration",
    description: "We're figuring this one out. Don't ask.",
    eta: "TBD",
  },
];

const Roadmap = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <section className="pt-32 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-sm font-meme text-primary mb-4 uppercase tracking-widest">The Path Ahead</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient-cheese">Roadmap</span> 🧀
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-meme max-w-xl mx-auto">
            What we've shipped, what we're building, and what cheesy ideas are next on the board.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Shipped <span className="text-gradient-cheese">So Far</span>
            </h2>
            <p className="text-muted-foreground font-meme">
              Every feature that made the cut. No bloat, just cheese.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden sm:block" />

            <div className="space-y-12">
              {milestones.map((item, i) => (
                <div key={i} className="relative pl-0 sm:pl-16">
                  <div className="absolute left-4 sm:left-3 top-1 w-7 h-7 rounded-full bg-primary/20 border-2 border-primary hidden sm:flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="rounded-xl border border-border bg-card p-6 card-hover">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground font-meme leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What's <span className="text-gradient-cheese">Next</span>
            </h2>
            <p className="text-muted-foreground font-meme">
              The cheese wheel keeps turning. Here's what's on the board.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcoming.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-6 card-hover"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                  <span className="text-xs font-meme text-gradient-cheese bg-primary/10 px-2 py-1 rounded-full">
                    {item.eta}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-meme leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-6">🗳️</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Got a <span className="text-gradient-cheese">Suggestion</span>?
          </h2>
          <p className="text-muted-foreground font-meme mb-8 text-lg">
            The roadmap is driven by what our users actually need.
            If you want something built, yell at us loud enough and we'll add it.
          </p>
          <a
            href="mailto:hello@briehosting.be"
            className="inline-block px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:scale-105 transition-transform glow-cheese"
          >
            Suggest a Feature 🧀
          </a>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Roadmap;
