import {
  Server,
  Zap,
  Shield,
  Globe,
  Clock,
  HeartHandshake,
  DatabaseBackup,
  MousePointerClick,
  Mail,
  Code2,
  Link,
  Rocket,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const features = [
  {
    icon: Zap,
    title: "Stupid Fast",
    description: "Our servers go brrrrr. Like, actually fast. Not 'fast for a Belgian company' fast.",
    meme: "⚡",
    glowClass: "glow-cheese",
  },
  {
    icon: Shield,
    title: "DDoS? LOL",
    description: "We eat DDoS attacks for breakfast. With some crackers and a nice Merlot.",
    meme: "🛡️",
    glowClass: "glow-pink",
  },
  {
    icon: Server,
    title: "99.9% Uptime",
    description: "The 0.1% is when our intern trips over the server cable. We're working on it.",
    meme: "🖥️",
    glowClass: "glow-cyan",
  },
  {
    icon: Globe,
    title: "CDN Everywhere",
    description: "Your content cached in more places than your ex's Instagram stalking history.",
    meme: "🌍",
    glowClass: "glow-cheese",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "We answer faster than you can say 'have you tried turning it off and on again'.",
    meme: "🕐",
    glowClass: "glow-pink",
  },
  {
    icon: HeartHandshake,
    title: "Free SSL",
    description: "Because hosting without SSL in 2026 is like brie without the rind. Criminal.",
    meme: "🔒",
    glowClass: "glow-cyan",
  },
  {
    icon: DatabaseBackup,
    title: "Auto Backups",
    description: "Daily backups so you never lose your masterpiece. Even if your cat walks on the keyboard.",
    meme: "💾",
    glowClass: "glow-cheese",
  },
  {
    icon: MousePointerClick,
    title: "One-Click WordPress",
    description: "Deploy WordPress faster than you can argue about whether Gutenberg is good. (It's fine.)",
    meme: "🖱️",
    glowClass: "glow-pink",
  },
  {
    icon: Mail,
    title: "Email Hosting",
    description: "Professional email that doesn't end up in spam. Unlike your newsletter. Sorry.",
    meme: "📧",
    glowClass: "glow-cyan",
  },
  {
    icon: Code2,
    title: "Dev Environments",
    description: "Staging, dev, prod — all isolated. No more 'oops I pushed to production' at 4PM Friday.",
    meme: "🧪",
    glowClass: "glow-cheese",
  },
  {
    icon: Link,
    title: "Custom Domains",
    description: "Your brand, your rules. We handle the DNS magic so you don't have to Google it at 2AM.",
    meme: "🔗",
    glowClass: "glow-pink",
  },
  {
    icon: Rocket,
    title: "Instant Deploys",
    description: "Push to git, site is live. Faster than explaining to your client what a 'cache' is.",
    meme: "🚀",
    glowClass: "glow-cyan",
  },
];

const comparison = [
  { feature: "Starting Price", us: "€4.99/mo", them: "€12.99/mo + 'setup fee'" },
  { feature: "Uptime SLA", us: "99.9%", them: "99% (on a good day)" },
  { feature: "Support Speed", us: "< 5 minutes", them: "3–5 business days 🙃" },
  { feature: "Free SSL", us: "✅ Always", them: "💸 Extra charge" },
  { feature: "Free Backups", us: "✅ Daily", them: "💸 Premium add-on" },
  { feature: "Belgian Quality", us: "🧀 Certified", them: "❌ Not even close" },
  { feature: "Waffle Iron Included", us: "🧇 On request", them: "❌ No waffles" },
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-sm font-meme text-primary mb-4 uppercase tracking-widest">What We Offer</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Everything You Need to{" "}
            <span className="text-gradient-cheese">Host Like a Pro</span>{" "}
            🧀
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-meme max-w-xl mx-auto">
            No hidden fees. No watered-down plans. Just pure Belgian hosting excellence, aged to perfection.
          </p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Full <span className="text-gradient-cheese">Cheese Board</span>
            </h2>
            <p className="text-muted-foreground font-meme max-w-xl mx-auto">
              12 reasons why switching to BrieHosting is the smartest thing you'll do this year. (Besides buying more cheese.)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card-hover rounded-xl border border-border bg-card p-6 group cursor-default"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-2xl">{feature.meme}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground font-meme text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why <span className="text-gradient-cheese">BrieHosting</span>?
            </h2>
            <p className="text-muted-foreground font-meme">
              We ran the numbers. The cheese won. Here's the proof.
            </p>
          </div>
          <div className="rounded-2xl border border-border overflow-hidden glow-cheese">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60">
                  <th className="text-left px-6 py-4 font-bold text-foreground">Feature</th>
                  <th className="px-6 py-4 font-bold text-center">
                    <span className="text-gradient-cheese">🧀 BrieHosting</span>
                  </th>
                  <th className="px-6 py-4 font-bold text-center text-muted-foreground">The Other Guys</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-t border-border ${i % 2 === 0 ? "bg-background/40" : "bg-card/40"}`}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{row.feature}</td>
                    <td className="px-6 py-4 text-center font-meme text-accent font-bold">{row.us}</td>
                    <td className="px-6 py-4 text-center font-meme text-muted-foreground">{row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to <span className="text-gradient-cheese">Get Started</span>?
          </h2>
          <p className="text-muted-foreground font-meme mb-8 text-lg">
            Pick a plan. Deploy in minutes. Eat cheese. That's literally the whole workflow.
          </p>
          <a
            href="/#pricing"
            className="inline-block px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:scale-105 transition-transform glow-cheese"
          >
            See Pricing 🧀
          </a>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Features;
