import { Check } from "lucide-react";

const plans = [
  {
    name: "Smol Brie",
    price: "€4.20",
    period: "/month",
    meme: "🧀",
    description: "For the solo dev who just needs a place to park their side project",
    features: [
      "1 Website",
      "5GB SSD Storage",
      "Free SSL (obv)",
      "Email support (we try)",
      "1 Database",
    ],
    cta: "Start Small 🐁",
    popular: false,
    borderClass: "border-border",
  },
  {
    name: "Thicc Brie",
    price: "€13.37",
    period: "/month",
    meme: "🧀🧀🧀",
    description: "For the absolute unit who needs POWER",
    features: [
      "Unlimited Websites",
      "50GB NVMe Storage",
      "Free SSL + Wildcard",
      "Priority Support (actually fast)",
      "10 Databases",
      "Staging Environments",
      "Auto Backups",
    ],
    cta: "Go Thicc 💪",
    popular: true,
    borderClass: "border-primary",
  },
  {
    name: "Mega Brie",
    price: "€42.69",
    period: "/month",
    meme: "🧀👑🧀",
    description: "You're either running a company or flexing. Either way, respect.",
    features: [
      "Everything in Thicc",
      "200GB NVMe Storage",
      "Dedicated Resources",
      "24/7 Phone Support",
      "Unlimited Databases",
      "Custom Domain Email",
      "DDoS Protection Pro",
      "Free Migration",
    ],
    cta: "Go Mega 🏆",
    popular: false,
    borderClass: "border-neon-cyan",
  },
];

const PricingSection = () => {
  return (
    <section className="py-24 px-4" id="pricing">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Pricing That Won't Make You <span className="text-secondary">Cry</span>
          </h2>
          <p className="text-muted-foreground text-lg font-meme max-w-xl mx-auto">
            No hidden fees. No "contact sales" BS. Just straight up cheese prices. 🧾
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-xl border-2 ${plan.borderClass} bg-card p-8 flex flex-col card-hover ${
                plan.popular ? "glow-cheese" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  MOST POPULAR 🔥
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-3xl mb-2">{plan.meme}</div>
                <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-muted-foreground text-sm font-meme mt-1">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-gradient-cheese">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`w-full py-3 rounded-lg font-bold text-lg transition-all hover:scale-105 text-center block ${
                  plan.popular
                    ? "bg-primary text-primary-foreground glow-cheese"
                    : "border border-border text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground text-xs mt-8 font-meme">
          All prices excl. VAT. 14-day money-back guarantee. No questions asked (okay maybe one question: why are you leaving? 😢)
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
