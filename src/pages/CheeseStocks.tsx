import { useState } from "react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";

interface CheeseStock {
  emoji: string;
  name: string;
  ticker: string;
  price: number;
  change: number;
  marketCap: string;
  description: string;
}

const BASE_STOCKS: CheeseStock[] = [
  { emoji: "🧀", name: "Brie de Meaux", ticker: "BDM", price: 42.00, change: 4.20, marketCap: "3.2B wheels", description: "The original. The legend. The one that pays the bills." },
  { emoji: "🟡", name: "Gouda", ticker: "GDA", price: 28.50, change: -1.35, marketCap: "12.1B rounds", description: "Smooth operator. The S&P 500 of cheese." },
  { emoji: "⚪", name: "Camembert", ticker: "CMB", price: 37.80, change: 2.15, marketCap: "2.7B boxes", description: "Brie's edgier cousin. Has a Norman accent." },
  { emoji: "🏔️", name: "Comté", ticker: "CTE", price: 61.00, change: -0.80, marketCap: "8.4B wheels", description: "Aged longer than your crypto portfolio. Worth it." },
  { emoji: "💙", name: "Roquefort", ticker: "RQF", price: 55.20, change: 7.77, marketCap: "1.9B caves", description: "Blue, bold, and not afraid of sheep. Based." },
  { emoji: "🟠", name: "Époisses", ticker: "EPS", price: 88.00, change: -3.14, marketCap: "420M crocks", description: "Smells illegal. Tastes transcendent. Napoleon's fave." },
  { emoji: "🌀", name: "Manchego", ticker: "MCH", price: 33.70, change: 1.11, marketCap: "5.5B wheels", description: "Spanish vibes only. The Don Quixote of cheese." },
  { emoji: "🏛️", name: "Parmigiano-Reggiano", ticker: "PRG", price: 120.00, change: 0.69, marketCap: "99.9B wedges", description: "The gold standard. Literally currency in Italy." },
  { emoji: "🫙", name: "Stilton", ticker: "STL", price: 47.50, change: -2.22, marketCap: "3.1B crumbles", description: "British. Blue. Protected by law. Very serious about itself." },
  { emoji: "🔥", name: "Halloumi", ticker: "HLM", price: 19.90, change: 12.50, marketCap: "6.6B slabs", description: "Doesn't melt. Doesn't quit. The absolute gym bro of cheese." },
];

function randomizeChanges(stocks: CheeseStock[]): CheeseStock[] {
  return BASE_STOCKS.map((s, i) => ({
    ...stocks[i],
    change: parseFloat((s.change + (Math.random() * 2 - 1)).toFixed(2)),
  }));
}

const CheeseStocks = () => {
  const [stocks, setStocks] = useState<CheeseStock[]>(BASE_STOCKS);

  const handleRefresh = () => {
    setStocks((prev) => randomizeChanges(prev));
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          🧀 <span className="text-gradient-cheese">Cheese Stock Exchange</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-2">
          Real-time* cheese market data.
        </p>
        <p className="font-meme text-muted-foreground text-sm mb-8">
          *data refreshes when we feel like it.
        </p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-105 transition-transform"
        >
          Refresh Market Data 🔄
        </button>
      </section>

      {/* Stock Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stocks.map((stock) => (
            <div
              key={stock.ticker}
              className="bg-card border border-border rounded-xl p-6 card-hover flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{stock.emoji}</span>
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                  {stock.ticker}
                </span>
              </div>
              <div>
                <h2 className="font-bold text-foreground text-base leading-tight">{stock.name}</h2>
                <p className="font-meme text-muted-foreground text-xs mt-1">{stock.description}</p>
              </div>
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <p className="text-xl font-bold text-primary">€{stock.price.toFixed(2)}</p>
                  <p
                    className={`text-sm font-bold ${
                      stock.change >= 0 ? "text-accent" : "text-destructive"
                    }`}
                  >
                    {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.change).toFixed(2)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Mkt Cap</p>
                  <p className="text-xs font-bold text-secondary">{stock.marketCap}</p>
                </div>
              </div>
              <a
                href="#"
                className="mt-2 text-center px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-105 transition-transform"
              >
                Buy 🧀
              </a>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-12 text-center font-meme text-muted-foreground text-xs">
          * This is not real financial advice. Please do not invest your savings in cheese. (Unless you really want to.)
        </p>
      </section>

      <FooterSection />
    </div>
  );
};

export default CheeseStocks;
