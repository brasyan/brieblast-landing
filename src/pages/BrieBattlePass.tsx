import {
  Trophy,
  Star,
  Swords,
  Gem,
  Shield,
  Rocket,
  Zap,
  Crown,
  Beer,
  MousePointerClick,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

const tiers = [
  {
    icon: MousePointerClick,
    title: "Brie Basics",
    price: "Free",
    color: "text-muted-foreground",
    border: "border-border",
    glow: "",
    perks: [
      "1 website (it's a start, champ)",
      "5 GB storage (write shorter code)",
      "1 email forward (pick your fav)",
      "Community support (aka the homies)",
      "99.9% uptime (we're not monsters)",
    ],
  },
  {
    icon: Crown,
    title: "Aged Cheddar",
    price: "€9.99/mo",
    color: "text-gradient-cheese",
    border: "border-primary/50",
    glow: "glow-cheese",
    perks: [
      "10 websites (go wild)",
      "50 GB storage (hoard like a squirrel)",
      "Free SSL (obviously)",
      "Priority support (< 2 min response)",
      "Daily backups (we got you)",
      "Custom domain (flex on 'em)",
      "Early access to new features (beta boi)",
    ],
    popular: true,
  },
  {
    icon: Gem,
    title: "Gouda God",
    price: "€24.99/mo",
    color: "text-secondary",
    border: "border-secondary/50",
    glow: "glow-pink",
    perks: [
      "Unlimited websites (go absolutely mental)",
      "250 GB NVMe storage (speeeeeed)",
      "Free SSL + Dedicated IP",
      "24/7 concierge support (we're your butlers)",
      "Real-time backups + 1-click restore",
      "Custom domains (as many as you want)",
      "DDoS protection (try us, we dare you)",
      "Free Brie merchandise (yes, real cheese)",
      "Name on the wall of fame (immortality)",
    ],
  },
];

const rewards = [
  { level: 1, reward: "🧀 Digital Cheese Wheel (profile badge)", xp: 0 },
  { level: 2, reward: "🐀 Rat With a Hat (forum avatar frame)", xp: 500 },
  { level: 3, reward: "🔧 Clank Mode Emote (use in comments)", xp: 1200 },
  { level: 4, reward: "⚡ Priority Queue Skip (1x use)", xp: 2500 },
  { level: 5, reward: "🎨 Custom .cheese Domain (brielliant)", xp: 5000 },
  { level: 6, reward: "🛡️ DDoS Protection Upgrade (+1 shield)", xp: 8500 },
  { level: 7, reward: "🧇 Waffle Iron (digital, not physical)", xp: 13000 },
  { level: 8, reward: "🏆 'Brie Elite' Discord Role", xp: 20000 },
  { level: 9, reward: "🚀 1 Month Free Hosting", xp: 30000 },
  { level: 10, reward: "👑 Gouda God Crown (flex forever)", xp: 50000 },
];

const BrieBattlePass = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-secondary/5 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 animate-pulse-glow">
            <span className="text-primary font-meme text-sm">🔥 NEW SEASON DROPPED 🔥</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold mb-6">
            <span className="text-gradient-cheese">Brie</span>Battle Pass
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-meme max-w-2xl mx-auto">
            Grind XP. Unlock cheese. Become a Gouda God. It's like a regular battle pass but
            smellier and more delicious.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">⚔️ 50 levels</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span className="flex items-center gap-1">🧀 100+ rewards</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span className="flex items-center gap-1">🤡 infinite memes</span>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pick Your <span className="text-gradient-cheese">Path</span>
            </h2>
            <p className="text-muted-foreground font-meme">Choose wisely. Or don't. We're not your mom.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className={`relative rounded-2xl border ${tier.border} bg-card p-6 sm:p-8 ${tier.glow} ${
                  tier.popular ? "scale-105 z-10" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold font-meme">
                    MOST POPULAR (trust us)
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <tier.icon className={`w-6 h-6 ${tier.color}`} />
                  </div>
                  <span className="text-2xl">{i === 0 ? "🧀" : i === 1 ? "🧀🧀" : "🧀🧀🧀"}</span>
                </div>
                <h3 className={`text-2xl font-bold mb-1 ${tier.color}`}>{tier.title}</h3>
                <p className="text-3xl font-bold text-foreground mb-6">{tier.price}</p>
                <ul className="space-y-3 mb-8">
                  {tier.perks.map((perk, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">✅</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-transform hover:scale-105 ${
                    tier.popular
                      ? "bg-primary text-primary-foreground glow-cheese"
                      : "border border-border text-foreground hover:border-primary"
                  }`}
                >
                  {tier.price === "Free" ? "Claim Now (it's free lol)" : `Get ${tier.title} 🧀`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* XP Grind */}
      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How to <span className="text-gradient-cheese">Grind XP</span>
            </h2>
            <p className="text-muted-foreground font-meme">
              Do stuff. Get points. Simple math.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { action: "Deploy a site", xp: "+250 XP", icon: Rocket },
              { action: "Refer a friend", xp: "+1000 XP", icon: Star },
              { action: "Report a bug", xp: "+500 XP", icon: Swords },
              { action: "Write a review", xp: "+300 XP", icon: Zap },
              { action: "Hit 99.9% uptime", xp: "+2000 XP", icon: Shield },
              { action: "Share on socials", xp: "+150 XP", icon: Beer },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-4 flex items-center gap-4 card-hover"
              >
                <div className="p-2 rounded-lg bg-muted">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{item.action}</p>
                  <p className="text-xs font-meme text-gradient-cheese">{item.xp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Track */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Reward <span className="text-gradient-cheese">Track</span>
            </h2>
            <p className="text-muted-foreground font-meme">
              10 levels of pure uncut dopamine. Every level unlocks something stupid.
            </p>
          </div>
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div
                key={reward.level}
                className="rounded-xl border border-border bg-card p-4 flex items-center justify-between card-hover"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    reward.level <= 3 ? "bg-primary/20 text-primary" :
                    reward.level <= 6 ? "bg-secondary/20 text-secondary" :
                    "bg-accent/20 text-accent"
                  }`}>
                    {reward.level}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{reward.reward}</p>
                    <p className="text-xs text-muted-foreground font-meme">Level {reward.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-meme text-gradient-cheese">{reward.xp.toLocaleString()} XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-6">🧀⚔️🧀</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to <span className="text-gradient-cheese">Level Up</span>?
          </h2>
          <p className="text-muted-foreground font-meme mb-8 text-lg">
            The Battle Pass is free. The rewards are eternal. The cheese is imaginary.
            <br />
            What are you waiting for? Go clank!
          </p>
          <a
            href="/register"
            className="inline-block px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:scale-105 transition-transform glow-cheese"
          >
            Start Grinding 🧀
          </a>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default BrieBattlePass;
