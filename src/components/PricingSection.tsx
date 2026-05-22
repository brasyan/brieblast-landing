import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const plans = [
  {
    name: "Smol Brie",
    planId: "smol_brie",
    price: "€4.20",
    period: "/month",
    meme: "🧀",
    description: "For the solo dev who just needs a place to park their side project",
    features: [
      "1 Website",
      "5GB SSD Storage",
      "Free SSL (obv)",
      "Email support (we try)",
      "Auto Backups",

    ],
    cta: "Start Small 🐁",
    popular: false,
    borderClass: "border-border",
  },
  {
    name: "Thicc Brie",
    planId: "thicc_brie",
    price: "€13.37",
    period: "/month",
    meme: "🧀🧀🧀",
    description: "For the absolute unit who needs POWER",
    features: [
      "3 Websites",
      "50GB NVMe Storage",
      "Free SSL + Wildcard",
      "Priority Support (actually fast)",
      "Auto Backups",
    ],
    cta: "Go Thicc 💪",
    popular: true,
    borderClass: "border-primary",
  },
  {
    name: "Mega Brie",
    planId: "mega_brie",
    price: "€42.69",
    period: "/month",
    meme: "🧀👑🧀",
    description: "You're either running a company or flexing. Either way, respect.",
    features: [
      "Everything in Thicc",
      "5 Websites",
      "200GB NVMe Storage",
      "Free Migration",
    ],
    cta: "Go Mega 🏆",
    popular: false,
    borderClass: "border-neon-cyan",
  },
];

const PricingSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelectPlan = (planId: string) => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <section className="py-16 sm:py-24 px-4" id="pricing">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
            Pricing That Won't Make You <span className="text-secondary">Cry</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-lg font-meme max-w-xl mx-auto">
            No hidden fees. No "contact sales" BS. Just straight up cheese prices. 🧾
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-xl border-2 ${plan.borderClass} bg-card p-4 sm:p-8 flex flex-col card-hover ${
                plan.popular ? "glow-cheese" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-bold">
                  MOST POPULAR 🔥
                </div>
              )}

              <div className="text-center mb-4 sm:mb-6">
                <div className="text-2xl sm:text-3xl mb-2">{plan.meme}</div>
                <h3 className="text-lg sm:text-2xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm font-meme mt-1">{plan.description}</p>
              </div>

              <div className="text-center mb-4 sm:mb-6">
                <span className="text-4xl sm:text-5xl font-bold text-gradient-cheese">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs sm:text-sm text-foreground">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.planId)}
                className={`w-full py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-lg transition-all hover:scale-105 ${
                  plan.popular
                    ? "bg-primary text-primary-foreground glow-cheese"
                    : "border border-border text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {plan.cta}
              </button>
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
