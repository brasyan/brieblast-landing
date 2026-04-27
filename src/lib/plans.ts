export type PlanId = "none" | "smol_brie" | "thicc_brie" | "mega_brie";

export interface PlanDetails {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  meme: string;
  description: string;
  features: string[];
  popular: boolean;
  /** Maximum number of sites allowed. null = unlimited. */
  maxSites: number | null;
}

export const PLANS: Record<Exclude<PlanId, "none">, PlanDetails> = {
  smol_brie: {
    id: "smol_brie",
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
    popular: false,
    maxSites: 1,
  },
  thicc_brie: {
    id: "thicc_brie",
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
    popular: true,
    maxSites: null,
  },
  mega_brie: {
    id: "mega_brie",
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
    popular: false,
    maxSites: null,
  },
};
