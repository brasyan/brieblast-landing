import { Sparkles, Shield, CreditCard, LayoutDashboard, Upload, Server, Eye, Lock, Wrench, ArrowUpRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const milestones = [
  {
    icon: Upload,
    title: "Site Upload & Import",
    description: "Upload your site via zip file or import directly from GitHub, GitLab, and git.gay repositories. Pick your subdomain before provisioning.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Overhaul",
    description: "Redesigned dashboard with auto-refresh while uploads are in flight, copy/open buttons for site URLs, and a manage modal for site settings.",
  },
  {
    icon: Shield,
    title: "Briescan Security Scanner",
    description: "Automated vulnerability scanning for all hosted sites. Detect malware, CVEs, and bad actors. Get alerted on failures and track scan status in real time.",
  },
  {
    icon: CreditCard,
    title: "Payment System",
    description: "Full Stripe payment flow with payment return handling, crypto payment option via Coinbase, Bancontact support, and payment history in the dashboard billing section.",
  },
  {
    icon: Lock,
    title: "Multi-Factor Auth",
    description: "MFA enrollment for new accounts with opt-in for existing users. Setup and verification pages with encouragement dialogs.",
  },
  {
    icon: Server,
    title: "Infrastructure & Provisioning",
    description: "Automated LXC container provisioning from uploads, per-plan site limits enforced, real-time Supabase subscriptions for site status updates.",
  },
  {
    icon: Eye,
    title: "Status Monitoring",
    description: "Live status page with service details, uptime tracking, and incident history.",
  },
  {
    icon: Wrench,
    title: "Admin Dashboard",
    description: "Admin panel with security alerts, site management, and system oversight.",
  },
  {
    icon: Sparkles,
    title: "One-Click Redeploy",
    description: "Re-deploy git-sourced sites with a single click. Pull latest changes from your repository without re-uploading.",
  },
];

const ImplementationPath = () => {
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
            Implementation <span className="text-gradient-cheese">Path</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-meme max-w-xl mx-auto">
            Everything we've shipped so far. No fluff, just features.
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {milestones.map((item, i) => (
              <div
                key={i}
                className="group rounded-xl border border-border bg-card p-6 card-hover hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-1.5 rounded-lg bg-muted">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground font-meme leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
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

export default ImplementationPath;
