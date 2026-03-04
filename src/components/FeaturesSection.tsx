import { Server, Zap, Shield, Globe, Clock, HeartHandshake } from "lucide-react";

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
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why We're <span className="text-gradient-cheese">Built Different</span>
          </h2>
          <p className="text-muted-foreground text-lg font-meme max-w-xl mx-auto">
            Other hosts promise the moon. We deliver the whole cheese wheel. 🌕
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`card-hover rounded-xl border border-border bg-card p-6 group cursor-default`}
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
  );
};

export default FeaturesSection;
